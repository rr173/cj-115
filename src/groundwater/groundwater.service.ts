import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import dayjs from 'dayjs';
import {
  CreateIrrigationZoneDto,
  UpdateIrrigationZoneDto,
  AdjustRedlineDto,
  RecordWaterLevelDepthDto,
  CreatePumpingWellDto,
  UpdatePumpingWellDto,
  GenerateJointSupplyPlanDto,
  AddZoneChannelDto,
} from './dto';
import {
  GroundwaterAlertType,
  GroundwaterAlertLevel,
  DepthSource,
  AllocationDroughtStatus,
  MeterStatus,
  MeterAbnormalType,
  ElectricityQuotaStatus,
} from '../common/enums';

const QUOTA_WARNING_RATIO = 0.85;
const DEVIATION_ABNORMAL_THRESHOLD = 0.2;

const REDLINE_WARNING_RATIO = 0.9;

@Injectable()
export class GroundwaterService {
  constructor(private prisma: PrismaService) {}

  private calcCanalSupplyFromAlloc(
    alloc: { flow: number; startTime: Date; endTime: Date; droughtStatus: string },
  ): number {
    if (alloc.droughtStatus === AllocationDroughtStatus.SUSPENDED) {
      return 0;
    }
    const durationSec = (new Date(alloc.endTime).getTime() - new Date(alloc.startTime).getTime()) / 1000;
    return alloc.flow * durationSec;
  }

  private calcAppCanalSupply(
    app: {
      requestVolume: number;
      allocations: Array<{
        channelId: string;
        flow: number;
        startTime: Date;
        endTime: Date;
        droughtStatus: string;
      }>;
      actualUsage?: { actualVolume: number } | null;
    },
    farmerChannelId: string,
  ): number {
    if (app.actualUsage) {
      return app.actualUsage.actualVolume;
    }
    const farmerAlloc = app.allocations.find((a) => a.channelId === farmerChannelId);
    if (!farmerAlloc) {
      if (app.allocations.length > 0) {
        return app.allocations
          .filter((a) => a.droughtStatus !== AllocationDroughtStatus.SUSPENDED)
          .reduce((sum, a) => sum + this.calcCanalSupplyFromAlloc(a), 0);
      }
      return 0;
    }
    return this.calcCanalSupplyFromAlloc(farmerAlloc);
  }

  async createIrrigationZone(dto: CreateIrrigationZoneDto) {
    const existing = await this.prisma.irrigationZone.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new BadRequestException('分区编号已存在');
    }

    const zone = await this.prisma.irrigationZone.create({
      data: {
        code: dto.code,
        name: dto.name,
        annualExtractionRedline: dto.annualExtractionRedline,
        currentWaterLevelDepth: dto.currentWaterLevelDepth,
        warningDepth: dto.warningDepth,
        recoverableCoefficient: dto.recoverableCoefficient ?? 10000,
        isOverExtracted: dto.currentWaterLevelDepth >= dto.warningDepth,
      },
    });

    await this.prisma.waterLevelDepthHistory.create({
      data: {
        zoneId: zone.id,
        depth: dto.currentWaterLevelDepth,
        source: DepthSource.MANUAL,
        operator: 'system',
        remark: '初始化',
      },
    });

    if (zone.isOverExtracted) {
      await this.createAlert(
        zone.id,
        GroundwaterAlertType.DEPTH_EXCEEDED,
        GroundwaterAlertLevel.CRITICAL,
        `分区[${zone.name}]初始水位埋深${zone.currentWaterLevelDepth}m已超过警戒埋深${zone.warningDepth}m`,
      );
    }

    return zone;
  }

  async updateIrrigationZone(zoneId: string, dto: UpdateIrrigationZoneDto) {
    const zone = await this.prisma.irrigationZone.findUnique({
      where: { id: zoneId },
    });
    if (!zone) throw new NotFoundException('灌溉分区不存在');

    return this.prisma.irrigationZone.update({
      where: { id: zoneId },
      data: dto,
    });
  }

  async listIrrigationZones() {
    return this.prisma.irrigationZone.findMany({
      include: {
        _count: { select: { wells: true, channelCoverages: true } },
      },
      orderBy: { code: 'asc' },
    });
  }

  async getZoneWaterLedger(zoneId: string, year?: number) {
    const zone = await this.prisma.irrigationZone.findUnique({
      where: { id: zoneId },
      include: {
        wells: true,
        channelCoverages: { select: { channelId: true } },
      },
    });
    if (!zone) throw new NotFoundException('灌溉分区不存在');

    const targetYear = year ?? dayjs().year();
    const yearStart = dayjs(`${targetYear}-01-01`).startOf('year').toDate();
    const yearEnd = dayjs(`${targetYear}-01-01`).endOf('year').toDate();

    const extractionRecords = await this.prisma.groundwaterExtractionRecord.findMany({
      where: {
        zoneId,
        startTime: { gte: yearStart, lte: yearEnd },
      },
    });

    const annualExtracted = extractionRecords.reduce((sum, r) => sum + r.volume, 0);
    const redlineRemaining = Math.max(0, zone.annualExtractionRedline - annualExtracted);
    const redlineUsageRatio = zone.annualExtractionRedline > 0
      ? annualExtracted / zone.annualExtractionRedline
      : 0;

    const zoneChannelIds = new Set(zone.channelCoverages.map((c) => c.channelId));
    let canalSuppliedVolume = 0;

    if (zoneChannelIds.size > 0) {
      const farmersInZone = await this.prisma.farmer.findMany({
        where: { channelId: { in: [...zoneChannelIds] } },
        select: { id: true, channelId: true },
      });
      const farmerIds = farmersInZone.map((f) => f.id);
      const farmerChannelMap = new Map(farmersInZone.map((f) => [f.id, f.channelId]));

      if (farmerIds.length > 0) {
        const appsInZone = await this.prisma.waterApplication.findMany({
          where: {
            farmerId: { in: farmerIds },
            targetDate: { gte: yearStart, lte: yearEnd },
            status: { in: ['SCHEDULED', 'EXECUTED'] },
          },
          include: {
            allocations: {
              select: {
                channelId: true,
                flow: true,
                startTime: true,
                endTime: true,
                droughtStatus: true,
              },
            },
            actualUsage: { select: { actualVolume: true } },
          },
        });

        for (const app of appsInZone) {
          const farmerChannelId = farmerChannelMap.get(app.farmerId);
          if (farmerChannelId) {
            canalSuppliedVolume += this.calcAppCanalSupply(app as any, farmerChannelId);
          }
        }
      }
    }

    const unresolvedAlerts = await this.prisma.groundwaterAlert.findMany({
      where: { zoneId, isResolved: false },
      orderBy: { triggeredAt: 'desc' },
    });

    return {
      zone: {
        id: zone.id,
        code: zone.code,
        name: zone.name,
        annualExtractionRedline: zone.annualExtractionRedline,
        warningDepth: zone.warningDepth,
        recoverableCoefficient: zone.recoverableCoefficient,
      },
      year: targetYear,
      surfaceWaterSupply: +canalSuppliedVolume.toFixed(2),
      groundwaterExtraction: +annualExtracted.toFixed(2),
      redlineRemaining: +redlineRemaining.toFixed(2),
      redlineUsageRatio: +(redlineUsageRatio * 100).toFixed(2) + '%',
      redlineStatus: redlineUsageRatio >= 1
        ? '已达红线'
        : redlineUsageRatio >= REDLINE_WARNING_RATIO
        ? '接近红线(预警)'
        : '正常',
      currentWaterLevelDepth: zone.currentWaterLevelDepth,
      depthStatus: zone.currentWaterLevelDepth >= zone.warningDepth
        ? '超警戒(超采)'
        : zone.currentWaterLevelDepth >= zone.warningDepth * 0.9
        ? '接近警戒'
        : '正常',
      isOverExtracted: zone.isOverExtracted,
      wellCount: zone.wells.length,
      activeWells: zone.wells.filter((w) => w.isActive).length,
      coveredChannelCount: zoneChannelIds.size,
      unresolvedAlerts: unresolvedAlerts.map((a) => ({
        id: a.id,
        type: a.type,
        level: a.level,
        message: a.message,
        triggeredAt: a.triggeredAt,
      })),
    };
  }

  async adjustRedline(dto: AdjustRedlineDto) {
    const zone = await this.prisma.irrigationZone.findUnique({
      where: { id: dto.zoneId },
    });
    if (!zone) throw new NotFoundException('灌溉分区不存在');

    if (dto.newRedline < zone.annualExtractedVolume) {
      throw new BadRequestException(
        `新红线${dto.newRedline}m³不能小于当年已开采量${zone.annualExtractedVolume.toFixed(2)}m³`,
      );
    }

    const updated = await this.prisma.irrigationZone.update({
      where: { id: dto.zoneId },
      data: { annualExtractionRedline: dto.newRedline },
    });

    return {
      zoneId: updated.id,
      oldRedline: zone.annualExtractionRedline,
      newRedline: dto.newRedline,
      reason: dto.reason,
      operator: dto.operator,
      adjustedAt: new Date(),
    };
  }

  async recordWaterLevelDepth(dto: RecordWaterLevelDepthDto) {
    const zone = await this.prisma.irrigationZone.findUnique({
      where: { id: dto.zoneId },
    });
    if (!zone) throw new NotFoundException('灌溉分区不存在');

    const wasOverExtracted = zone.isOverExtracted;
    const isNowOverExtracted = dto.measuredDepth >= zone.warningDepth;

    const updated = await this.prisma.irrigationZone.update({
      where: { id: dto.zoneId },
      data: {
        currentWaterLevelDepth: dto.measuredDepth,
        isOverExtracted: isNowOverExtracted,
      },
    });

    await this.prisma.waterLevelDepthHistory.create({
      data: {
        zoneId: dto.zoneId,
        depth: dto.measuredDepth,
        source: DepthSource.MEASURED,
        operator: dto.operator,
        remark: dto.remark,
      },
    });

    if (!wasOverExtracted && isNowOverExtracted) {
      await this.createAlert(
        dto.zoneId,
        GroundwaterAlertType.DEPTH_EXCEEDED,
        GroundwaterAlertLevel.CRITICAL,
        `分区[${zone.name}]实测水位埋深${dto.measuredDepth}m超过警戒埋深${zone.warningDepth}m，触发超采告警`,
      );
    } else if (wasOverExtracted && !isNowOverExtracted) {
      await this.resolveAlerts(dto.zoneId, GroundwaterAlertType.DEPTH_EXCEEDED);
    }

    return {
      zoneId: updated.id,
      previousDepth: zone.currentWaterLevelDepth,
      measuredDepth: dto.measuredDepth,
      wasOverExtracted,
      isNowOverExtracted,
      operator: dto.operator,
      recordedAt: new Date(),
    };
  }

  async addZoneChannel(dto: AddZoneChannelDto) {
    const zone = await this.prisma.irrigationZone.findUnique({
      where: { id: dto.zoneId },
    });
    if (!zone) throw new NotFoundException('灌溉分区不存在');

    const channel = await this.prisma.channel.findUnique({
      where: { id: dto.channelId },
    });
    if (!channel) throw new NotFoundException('渠道不存在');

    const existing = await this.prisma.irrigationZoneChannel.findFirst({
      where: { channelId: dto.channelId },
    });
    if (existing) {
      throw new BadRequestException(
        `渠道[${channel.code}]已关联到其他灌溉分区，一条农渠只能属于一个分区`,
      );
    }

    return this.prisma.irrigationZoneChannel.create({
      data: {
        zoneId: dto.zoneId,
        channelId: dto.channelId,
      },
      include: {
        zone: { select: { id: true, code: true, name: true } },
        channel: { select: { id: true, code: true, name: true, level: true } },
      },
    });
  }

  async removeZoneChannel(zoneId: string, channelId: string) {
    const coverage = await this.prisma.irrigationZoneChannel.findUnique({
      where: { zoneId_channelId: { zoneId, channelId } },
    });
    if (!coverage) throw new NotFoundException('该渠道未关联到此分区');

    return this.prisma.irrigationZoneChannel.delete({
      where: { id: coverage.id },
    });
  }

  async getZoneChannels(zoneId: string) {
    const zone = await this.prisma.irrigationZone.findUnique({
      where: { id: zoneId },
    });
    if (!zone) throw new NotFoundException('灌溉分区不存在');

    return this.prisma.irrigationZoneChannel.findMany({
      where: { zoneId },
      include: {
        channel: { select: { id: true, code: true, name: true, level: true } },
      },
      orderBy: { channel: { code: 'asc' } },
    });
  }

  async createPumpingWell(dto: CreatePumpingWellDto) {
    const zone = await this.prisma.irrigationZone.findUnique({
      where: { id: dto.zoneId },
    });
    if (!zone) throw new NotFoundException('灌溉分区不存在');

    const existingCode = await this.prisma.pumpingWell.findUnique({
      where: { code: dto.code },
    });
    if (existingCode) {
      throw new BadRequestException('机井编号已存在');
    }

    if (dto.associatedChannelId) {
      const channel = await this.prisma.channel.findUnique({
        where: { id: dto.associatedChannelId },
      });
      if (!channel) throw new NotFoundException('关联农渠不存在');
    }

    return this.prisma.pumpingWell.create({
      data: {
        code: dto.code,
        zoneId: dto.zoneId,
        ratedFlow: dto.ratedFlow,
        unitCost: dto.unitCost,
        associatedChannelId: dto.associatedChannelId,
        associatedPlot: dto.associatedPlot,
      },
      include: { zone: { select: { id: true, code: true, name: true } } },
    });
  }

  async updatePumpingWell(wellId: string, dto: UpdatePumpingWellDto) {
    const well = await this.prisma.pumpingWell.findUnique({
      where: { id: wellId },
    });
    if (!well) throw new NotFoundException('机井不存在');

    if (dto.zoneId) {
      const zone = await this.prisma.irrigationZone.findUnique({
        where: { id: dto.zoneId },
      });
      if (!zone) throw new NotFoundException('灌溉分区不存在');
    }

    if (dto.associatedChannelId) {
      const channel = await this.prisma.channel.findUnique({
        where: { id: dto.associatedChannelId },
      });
      if (!channel) throw new NotFoundException('关联农渠不存在');
    }

    return this.prisma.pumpingWell.update({
      where: { id: wellId },
      data: dto,
      include: { zone: { select: { id: true, code: true, name: true } } },
    });
  }

  async listPumpingWells(zoneId?: string) {
    const where: any = {};
    if (zoneId) where.zoneId = zoneId;

    return this.prisma.pumpingWell.findMany({
      where,
      include: { zone: { select: { id: true, code: true, name: true } } },
      orderBy: { code: 'asc' },
    });
  }

  async getPumpingWellHistory(wellId: string, dateFrom?: string, dateTo?: string) {
    const well = await this.prisma.pumpingWell.findUnique({
      where: { id: wellId },
      include: { zone: { select: { id: true, code: true, name: true } } },
    });
    if (!well) throw new NotFoundException('机井不存在');

    const where: any = { wellId };
    if (dateFrom || dateTo) {
      where.startTime = {};
      if (dateFrom) where.startTime.gte = dayjs(dateFrom).startOf('day').toDate();
      if (dateTo) where.startTime.lt = dayjs(dateTo).add(1, 'day').startOf('day').toDate();
    }

    const records = await this.prisma.groundwaterExtractionRecord.findMany({
      where,
      include: {
        application: { include: { farmer: { select: { code: true, name: true } } } },
      },
      orderBy: { startTime: 'desc' },
    });

    const totalVolume = records.reduce((sum, r) => sum + r.volume, 0);
    const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
    const totalHours = records.reduce((sum, r) => sum + r.durationHours, 0);

    return {
      well: {
        id: well.id,
        code: well.code,
        ratedFlow: well.ratedFlow,
        unitCost: well.unitCost,
        isActive: well.isActive,
        zone: well.zone,
      },
      summary: {
        extractionCount: records.length,
        totalVolume: +totalVolume.toFixed(2),
        totalCost: +totalCost.toFixed(2),
        totalRunningHours: +totalHours.toFixed(2),
      },
      records: records.map((r) => ({
        id: r.id,
        volume: r.volume,
        durationHours: r.durationHours,
        cost: r.cost,
        startTime: r.startTime,
        endTime: r.endTime,
        application: r.application
          ? {
              id: r.application.id,
              farmerCode: r.application.farmer?.code,
              farmerName: r.application.farmer?.name,
            }
          : null,
      })),
    };
  }

  async generateJointSupplyPlan(dto: GenerateJointSupplyPlanDto) {
    const application = await this.prisma.waterApplication.findUnique({
      where: { id: dto.applicationId },
      include: {
        farmer: { include: { channel: true } },
        allocations: true,
        actualUsage: true,
      },
    });
    if (!application) throw new NotFoundException('用水申请不存在');

    const requestedVolume = application.requestVolume;
    const farmerChannelId = application.farmer.channelId;

    const canalSuppliedVolume = this.calcAppCanalSupply(application, farmerChannelId);

    let gapVolume = Math.max(0, requestedVolume - canalSuppliedVolume);

    const zoneCoverage = await this.prisma.irrigationZoneChannel.findFirst({
      where: { channelId: farmerChannelId },
      include: {
        zone: {
          include: { wells: { where: { isActive: true }, orderBy: { unitCost: 'asc' } } },
        },
      },
    });

    let zone = zoneCoverage?.zone ?? null;

    let wellSuppliedVolume = 0;
    let totalCost = 0;
    const wellDetails: any[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    if (!zone && gapVolume > 0) {
      errors.push(
        `农户所在农渠[${application.farmer.channel.code}]未纳入任何灌溉分区，无法启动机井补源`,
      );
    }

    if (gapVolume > 0 && zone) {
      if (zone.currentWaterLevelDepth >= zone.warningDepth) {
        errors.push(`分区[${zone.name}]水位埋深${zone.currentWaterLevelDepth}m已超过警戒埋深${zone.warningDepth}m，禁止启用机井`);
      } else {
        const remainingRedline = Math.max(0, zone.annualExtractionRedline - zone.annualExtractedVolume);
        if (remainingRedline <= 0) {
          errors.push(`分区[${zone.name}]年度开采量已达红线${zone.annualExtractionRedline}m³，禁止新增开采`);
        } else {
          const usageRatio = zone.annualExtractionRedline > 0
            ? zone.annualExtractedVolume / zone.annualExtractionRedline
            : 0;
          if (usageRatio >= REDLINE_WARNING_RATIO) {
            warnings.push(
              `分区[${zone.name}]已开采${zone.annualExtractedVolume.toFixed(2)}m³，占红线${(usageRatio * 100).toFixed(1)}%，接近红线预警`,
            );
          }

          if (zone.wells.length === 0) {
            errors.push(`分区[${zone.name}]无可用机井，无法补源`);
          } else {
            const availableVolume = Math.min(gapVolume, remainingRedline);

            for (const well of zone.wells) {
              if (wellSuppliedVolume >= availableVolume) break;

              const needVolume = availableVolume - wellSuppliedVolume;
              const durationHours = needVolume / well.ratedFlow;
              const actualVolume = needVolume;
              const cost = actualVolume * well.unitCost;

              wellSuppliedVolume += actualVolume;
              totalCost += cost;

              wellDetails.push({
                wellId: well.id,
                wellCode: well.code,
                ratedFlow: well.ratedFlow,
                unitCost: well.unitCost,
                suppliedVolume: +actualVolume.toFixed(2),
                durationHours: +durationHours.toFixed(2),
                cost: +cost.toFixed(2),
              });
            }

            if (wellSuppliedVolume < gapVolume) {
              warnings.push(
                `缺口${gapVolume.toFixed(2)}m³仅补满${wellSuppliedVolume.toFixed(2)}m³，剩余${(gapVolume - wellSuppliedVolume).toFixed(2)}m³无法补足（受开采红线或可用机井限制）`,
              );
            }
          }
        }
      }
    }

    return {
      application: {
        id: application.id,
        farmerCode: application.farmer.code,
        farmerName: application.farmer.name,
        requestedVolume: +requestedVolume.toFixed(2),
      },
      zone: zone
        ? { id: zone.id, code: zone.code, name: zone.name }
        : null,
      canalSuppliedVolume: +canalSuppliedVolume.toFixed(2),
      requiredWellSupplement: +gapVolume.toFixed(2),
      actualWellSuppliedVolume: +wellSuppliedVolume.toFixed(2),
      unsatisfiedVolume: +(gapVolume - wellSuppliedVolume).toFixed(2),
      totalCost: +totalCost.toFixed(2),
      wellDetails,
      warnings,
      errors,
      canSatisfy: errors.length === 0 && wellSuppliedVolume >= gapVolume - 0.01,
    };
  }

  async executeJointSupply(dto: GenerateJointSupplyPlanDto) {
    const plan = await this.generateJointSupplyPlan(dto);

    if (plan.errors.length > 0) {
      throw new BadRequestException(plan.errors.join('; '));
    }

    if (!plan.zone || plan.wellDetails.length === 0) {
      return {
        ...plan,
        executed: false,
        reason: '无需机井补水或无可执行方案',
      };
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const existingPlan = await tx.jointWaterSupplyPlan.findUnique({
        where: { applicationId: dto.applicationId },
      });
      if (existingPlan) {
        throw new BadRequestException('该申请已存在联合供水方案');
      }

      const supplyPlan = await tx.jointWaterSupplyPlan.create({
        data: {
          applicationId: dto.applicationId,
          zoneId: plan.zone!.id,
          requestedVolume: plan.application.requestedVolume,
          canalSuppliedVolume: plan.canalSuppliedVolume,
          wellSuppliedVolume: plan.actualWellSuppliedVolume,
          totalCost: plan.totalCost,
        },
      });

      let totalExtracted = 0;
      const records: any[] = [];

      for (const detail of plan.wellDetails) {
        const startTime = new Date();
        const endTime = dayjs(startTime).add(detail.durationHours, 'hour').toDate();

        const record = await tx.groundwaterExtractionRecord.create({
          data: {
            wellId: detail.wellId,
            zoneId: plan.zone!.id,
            applicationId: dto.applicationId,
            planId: supplyPlan.id,
            volume: detail.suppliedVolume,
            durationHours: detail.durationHours,
            cost: detail.cost,
            startTime,
            endTime,
          },
        });
        totalExtracted += detail.suppliedVolume;
        records.push(record);

        await tx.jointSupplyDetail.create({
          data: {
            planId: supplyPlan.id,
            wellId: detail.wellId,
            volume: detail.suppliedVolume,
            durationHours: detail.durationHours,
            cost: detail.cost,
          },
        });
      }

      const zone = await tx.irrigationZone.findUnique({
        where: { id: plan.zone!.id },
      });
      if (!zone) throw new NotFoundException('分区不存在');

      const newAnnualExtracted = zone.annualExtractedVolume + totalExtracted;
      const depthIncrement = totalExtracted / zone.recoverableCoefficient;
      const newDepth = zone.currentWaterLevelDepth + depthIncrement;
      const nowOverExtracted = newDepth >= zone.warningDepth;

      await tx.irrigationZone.update({
        where: { id: plan.zone!.id },
        data: {
          annualExtractedVolume: newAnnualExtracted,
          currentWaterLevelDepth: newDepth,
          isOverExtracted: nowOverExtracted,
          lastExtractedAt: new Date(),
        },
      });

      await tx.waterLevelDepthHistory.create({
        data: {
          zoneId: plan.zone!.id,
          depth: newDepth,
          source: DepthSource.CALCULATED,
          operator: 'system',
          remark: `机井抽水${totalExtracted.toFixed(2)}m³，埋深增加${depthIncrement.toFixed(4)}m`,
        },
      });

      return { supplyPlan, records, newAnnualExtracted, newDepth, nowOverExtracted, zone };
    });

    const usageRatio = result.zone.annualExtractionRedline > 0
      ? result.newAnnualExtracted / result.zone.annualExtractionRedline
      : 0;

    if (usageRatio >= 1) {
      await this.createAlert(
        plan.zone!.id,
        GroundwaterAlertType.REDLINE_BLOCKED,
        GroundwaterAlertLevel.CRITICAL,
        `分区[${result.zone.name}]年度开采量已达100%红线${result.zone.annualExtractionRedline}m³，后续机井调度将被拦截`,
      );
    } else if (usageRatio >= REDLINE_WARNING_RATIO) {
      await this.createAlert(
        plan.zone!.id,
        GroundwaterAlertType.REDLINE_WARNING,
        GroundwaterAlertLevel.WARNING,
        `分区[${result.zone.name}]年度开采量已达${(usageRatio * 100).toFixed(1)}%，接近红线${result.zone.annualExtractionRedline}m³`,
      );
    }

    if (result.nowOverExtracted && !result.zone.isOverExtracted) {
      await this.createAlert(
        plan.zone!.id,
        GroundwaterAlertType.DEPTH_EXCEEDED,
        GroundwaterAlertLevel.CRITICAL,
        `分区[${result.zone.name}]水位埋深${result.newDepth.toFixed(3)}m超过警戒埋深${result.zone.warningDepth}m，触发超采告警`,
      );
    }

    return {
      ...plan,
      executed: true,
      planId: result.supplyPlan.id,
      updatedZoneStatus: {
        newAnnualExtracted: +result.newAnnualExtracted.toFixed(2),
        newWaterLevelDepth: +result.newDepth.toFixed(3),
        isOverExtracted: result.nowOverExtracted,
        redlineUsagePercent: +(usageRatio * 100).toFixed(2) + '%',
      },
    };
  }

  async getJointSupplyPlan(applicationId: string) {
    const plan = await this.prisma.jointWaterSupplyPlan.findUnique({
      where: { applicationId },
      include: {
        zone: { select: { id: true, code: true, name: true } },
        application: {
          include: { farmer: { select: { id: true, code: true, name: true } } },
        },
        details: {
          include: { well: { select: { id: true, code: true, ratedFlow: true, unitCost: true } } },
        },
      },
    });
    if (!plan) throw new NotFoundException('该申请无联合供水方案');

    return {
      plan: {
        id: plan.id,
        createdAt: plan.createdAt,
        requestedVolume: plan.requestedVolume,
        canalSuppliedVolume: plan.canalSuppliedVolume,
        wellSuppliedVolume: plan.wellSuppliedVolume,
        totalCost: plan.totalCost,
      },
      zone: plan.zone,
      application: {
        id: plan.application.id,
        farmerCode: plan.application.farmer.code,
        farmerName: plan.application.farmer.name,
      },
      wellDetails: plan.details.map((d) => ({
        wellId: d.wellId,
        wellCode: d.well.code,
        ratedFlow: d.well.ratedFlow,
        unitCost: d.well.unitCost,
        volume: d.volume,
        durationHours: d.durationHours,
        cost: d.cost,
      })),
    };
  }

  async listAlerts(zoneId?: string, resolved?: boolean) {
    const where: any = {};
    if (zoneId) where.zoneId = zoneId;
    if (resolved !== undefined) where.isResolved = false;

    return this.prisma.groundwaterAlert.findMany({
      where,
      include: { zone: { select: { id: true, code: true, name: true } } },
      orderBy: { triggeredAt: 'desc' },
    });
  }

  private async createAlert(
    zoneId: string,
    type: GroundwaterAlertType,
    level: GroundwaterAlertLevel,
    message: string,
  ) {
    const existing = await this.prisma.groundwaterAlert.findFirst({
      where: { zoneId, type, isResolved: false },
    });
    if (existing) return existing;

    return this.prisma.groundwaterAlert.create({
      data: { zoneId, type, level, message },
    });
  }

  private async resolveAlerts(zoneId: string, type?: GroundwaterAlertType) {
    const where: any = { zoneId, isResolved: false };
    if (type) where.type = type;

    await this.prisma.groundwaterAlert.updateMany({
      where,
      data: { isResolved: true, resolvedAt: new Date() },
    });
  }

  async registerSmartMeter(dto: any) {
    const well = await this.prisma.pumpingWell.findUnique({
      where: { id: dto.wellId },
      include: { meter: true },
    });
    if (!well) throw new NotFoundException('机井不存在');
    if (well.meter) throw new BadRequestException('该机井已登记电表');

    const existingMeter = await this.prisma.smartMeter.findUnique({
      where: { meterNo: dto.meterNo },
    });
    if (existingMeter) throw new BadRequestException('该表号已被使用');

    const initialReading = dto.initialReading ?? 0;
    const meter = await this.prisma.smartMeter.create({
      data: {
        meterNo: dto.meterNo,
        wellId: dto.wellId,
        initialReading,
        lastReading: initialReading,
        status: MeterStatus.NORMAL,
        remark: dto.remark,
      },
      include: {
        well: {
          select: {
            id: true,
            code: true,
            zone: { select: { id: true, code: true, name: true } },
          },
        },
      },
    });

    return meter;
  }

  async updateSmartMeter(meterId: string, dto: any) {
    const meter = await this.prisma.smartMeter.findUnique({ where: { id: meterId } });
    if (!meter) throw new NotFoundException('电表不存在');

    if (dto.meterNo) {
      const existing = await this.prisma.smartMeter.findUnique({ where: { meterNo: dto.meterNo } });
      if (existing && existing.id !== meterId) {
        throw new BadRequestException('该表号已被使用');
      }
    }

    return this.prisma.smartMeter.update({
      where: { id: meterId },
      data: dto,
      include: {
        well: {
          select: {
            id: true,
            code: true,
            zone: { select: { id: true, code: true, name: true } },
          },
        },
      },
    });
  }

  async listSmartMeters(zoneId?: string) {
    const where: any = {};
    if (zoneId) where.well = { zoneId };

    return this.prisma.smartMeter.findMany({
      where,
      include: {
        well: {
          select: {
            id: true,
            code: true,
            electricityToWaterCoefficient: true,
            zone: { select: { id: true, code: true, name: true } },
          },
        },
      },
      orderBy: { meterNo: 'asc' },
    });
  }

  async getSmartMeter(meterId: string) {
    const meter = await this.prisma.smartMeter.findUnique({
      where: { id: meterId },
      include: {
        well: {
          select: {
            id: true,
            code: true,
            electricityToWaterCoefficient: true,
            zone: { select: { id: true, code: true, name: true } },
          },
        },
      },
    });
    if (!meter) throw new NotFoundException('电表不存在');
    return meter;
  }

  async updateCoefficient(dto: any) {
    const well = await this.prisma.pumpingWell.findUnique({ where: { id: dto.wellId } });
    if (!well) throw new NotFoundException('机井不存在');

    const updated = await this.prisma.pumpingWell.update({
      where: { id: dto.wellId },
      data: { electricityToWaterCoefficient: dto.coefficient },
      include: { zone: { select: { id: true, code: true, name: true } } },
    });

    return {
      wellId: updated.id,
      wellCode: updated.code,
      oldCoefficient: well.electricityToWaterCoefficient,
      newCoefficient: dto.coefficient,
      zone: updated.zone,
    };
  }

  async reportMeterReading(dto: any) {
    const meter = await this.prisma.smartMeter.findUnique({
      where: { meterNo: dto.meterNo },
      include: { well: { include: { zone: true } } },
    });
    if (!meter) throw new NotFoundException('电表不存在');

    if (meter.status !== MeterStatus.NORMAL) {
      throw new BadRequestException(
        `电表状态为[${meter.status}]，暂无法上报读数，请先处理异常`,
      );
    }

    const reportedAt = dto.reportedAt ? new Date(dto.reportedAt) : new Date();
    const previousReading = meter.lastReading;
    const currentReading = dto.reading;

    if (currentReading < previousReading) {
      const alert = await this.prisma.meterAbnormalAlert.create({
        data: {
          meterId: meter.id,
          wellId: meter.wellId,
          type: MeterAbnormalType.READING_REVERSED,
          message: `电表[${meter.meterNo}]读数异常:上次读数${previousReading}度,本次${currentReading}度,读数倒转`,
          previousReading,
          currentReading,
        },
      });

      await this.prisma.smartMeter.update({
        where: { id: meter.id },
        data: { status: MeterStatus.ABNORMAL },
      });

      await this.prisma.meterReading.create({
        data: {
          meterId: meter.id,
          wellId: meter.wellId,
          zoneId: meter.well.zoneId,
          previousReading,
          currentReading,
          consumption: 0,
          isAbnormal: true,
          abnormalReason: '读数倒转',
          reportedAt,
        },
      });

      return {
        accepted: false,
        abnormal: true,
        alertId: alert.id,
        message: '读数异常(倒转),已生成异常告警,不计入抽水量,等待管理员核定新基准读数',
        previousReading,
        currentReading,
      };
    }

    const consumption = currentReading - previousReading;
    if (consumption === 0) {
      await this.prisma.meterReading.create({
        data: {
          meterId: meter.id,
          wellId: meter.wellId,
          zoneId: meter.well.zoneId,
          previousReading,
          currentReading,
          consumption: 0,
          reportedAt,
        },
      });

      await this.prisma.smartMeter.update({
        where: { id: meter.id },
        data: { lastReading: currentReading, lastReportedAt: reportedAt },
      });

      return {
        accepted: true,
        abnormal: false,
        message: '本次无新增耗电量',
        previousReading,
        currentReading,
        consumption: 0,
        waterVolume: 0,
      };
    }

    const zone = meter.well.zone;
    const activeQuota = await this.prisma.electricityQuota.findFirst({
      where: {
        zoneId: zone.id,
        startDate: { lte: reportedAt },
        endDate: { gte: reportedAt },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (activeQuota && activeQuota.blocked) {
      throw new BadRequestException(
        `分区[${zone.name}]本灌溉季电量配额已用尽(${activeQuota.usedKwh.toFixed(2)}/${activeQuota.totalKwh}度),禁止继续抽水,请管理员扩配或换季清零`,
      );
    }

    let quotaId: string | null = null;
    let quotaBlockedAfter = false;
    let quotaWarningAfter = false;

    if (activeQuota) {
      const remainingKwh = activeQuota.totalKwh - activeQuota.usedKwh;
      if (consumption > remainingKwh + 0.001) {
        throw new BadRequestException(
          `分区电量配额剩余${remainingKwh.toFixed(2)}度,本次需${consumption.toFixed(2)}度,配额不足,请管理员扩配`,
        );
      }
      quotaId = activeQuota.id;
      const newUsedKwh = activeQuota.usedKwh + consumption;
      const usageRatio = newUsedKwh / activeQuota.totalKwh;
      quotaWarningAfter = usageRatio >= QUOTA_WARNING_RATIO && !activeQuota.warningSent;
      quotaBlockedAfter = usageRatio >= 1;
    }

    const coefficient = meter.well.electricityToWaterCoefficient;
    const waterVolume = consumption * coefficient;

    const result = await this.prisma.$transaction(async (tx) => {
      const readingRecord = await tx.meterReading.create({
        data: {
          meterId: meter.id,
          wellId: meter.wellId,
          zoneId: zone.id,
          previousReading,
          currentReading,
          consumption,
          reportedAt,
        },
      });

      const elecRecord = await tx.electricityExtractionRecord.create({
        data: {
          wellId: meter.wellId,
          zoneId: zone.id,
          meterReadingId: readingRecord.id,
          quotaId,
          consumptionKwh: consumption,
          waterVolume,
          coefficient,
          recordedAt: reportedAt,
        },
      });

      await tx.smartMeter.update({
        where: { id: meter.id },
        data: { lastReading: currentReading, lastReportedAt: reportedAt },
      });

      if (activeQuota) {
        const newUsedKwh = activeQuota.usedKwh + consumption;
        await tx.electricityQuota.update({
          where: { id: activeQuota.id },
          data: {
            usedKwh: newUsedKwh,
            warningSent: quotaWarningAfter ? true : activeQuota.warningSent,
            blocked: quotaBlockedAfter ? true : activeQuota.blocked,
          },
        });
      }

      const depthIncrement = waterVolume / zone.recoverableCoefficient;
      const newDepth = zone.currentWaterLevelDepth + depthIncrement;
      const nowOverExtracted = newDepth >= zone.warningDepth;

      await tx.irrigationZone.update({
        where: { id: zone.id },
        data: {
          annualExtractedVolume: zone.annualExtractedVolume + waterVolume,
          currentWaterLevelDepth: newDepth,
          isOverExtracted: nowOverExtracted,
          lastExtractedAt: reportedAt,
        },
      });

      await tx.waterLevelDepthHistory.create({
        data: {
          zoneId: zone.id,
          depth: newDepth,
          source: DepthSource.CALCULATED,
          operator: 'system',
          remark: `电折水抽水${waterVolume.toFixed(2)}m³,埋深增加${depthIncrement.toFixed(4)}m`,
        },
      });

      return { readingRecord, elecRecord, newDepth, nowOverExtracted };
    });

    if (quotaWarningAfter && activeQuota) {
      await this.createAlert(
        zone.id,
        GroundwaterAlertType.REDLINE_WARNING,
        GroundwaterAlertLevel.WARNING,
        `分区[${zone.name}]本灌溉季电量配额已使用${((activeQuota.usedKwh + consumption) / activeQuota.totalKwh * 100).toFixed(1)}%,接近${QUOTA_WARNING_RATIO * 100}%预警线`,
      );
    }

    if (quotaBlockedAfter && activeQuota) {
      await this.createAlert(
        zone.id,
        GroundwaterAlertType.REDLINE_BLOCKED,
        GroundwaterAlertLevel.CRITICAL,
        `分区[${zone.name}]本灌溉季电量配额已用尽${activeQuota.totalKwh}度,后续机井计量将被拦截`,
      );
    }

    return {
      accepted: true,
      abnormal: false,
      message: '读数上报成功',
      previousReading,
      currentReading,
      consumption: +consumption.toFixed(4),
      coefficient,
      waterVolume: +waterVolume.toFixed(2),
      zone: {
        id: zone.id,
        code: zone.code,
        name: zone.name,
      },
      well: {
        id: meter.wellId,
        code: meter.well.code,
      },
      recordedAt: reportedAt,
      quota: activeQuota
        ? {
            id: activeQuota.id,
            seasonName: activeQuota.seasonName,
            totalKwh: activeQuota.totalKwh,
            usedKwh: +(activeQuota.usedKwh + consumption).toFixed(2),
            warningTriggered: quotaWarningAfter,
            blocked: quotaBlockedAfter,
          }
        : null,
    };
  }

  async listMeterReadings(wellId?: string, meterId?: string, dateFrom?: string, dateTo?: string) {
    const where: any = {};
    if (wellId) where.wellId = wellId;
    if (meterId) where.meterId = meterId;
    if (dateFrom || dateTo) {
      where.reportedAt = {};
      if (dateFrom) where.reportedAt.gte = dayjs(dateFrom).startOf('day').toDate();
      if (dateTo) where.reportedAt.lt = dayjs(dateTo).add(1, 'day').startOf('day').toDate();
    }

    return this.prisma.meterReading.findMany({
      where,
      include: {
        meter: { select: { meterNo: true } },
        well: { select: { code: true } },
        zone: { select: { code: true, name: true } },
      },
      orderBy: { reportedAt: 'desc' },
    });
  }

  async listMeterAbnormalAlerts(resolved?: boolean) {
    const where: any = {};
    if (resolved !== undefined) where.isResolved = resolved;

    return this.prisma.meterAbnormalAlert.findMany({
      where,
      include: {
        meter: { select: { meterNo: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveMeterAbnormal(dto: any) {
    const alert = await this.prisma.meterAbnormalAlert.findUnique({
      where: { id: dto.alertId },
      include: { meter: true },
    });
    if (!alert) throw new NotFoundException('告警不存在');
    if (alert.isResolved) throw new BadRequestException('该告警已处理');

    await this.prisma.$transaction(async (tx) => {
      await tx.smartMeter.update({
        where: { id: alert.meterId },
        data: {
          status: MeterStatus.NORMAL,
          lastReading: dto.newBaselineReading,
          initialReading: dto.newBaselineReading,
        },
      });

      await tx.meterAbnormalAlert.update({
        where: { id: dto.alertId },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
          resolvedBy: dto.operator,
          newBaselineReading: dto.newBaselineReading,
        },
      });
    });

    return {
      alertId: alert.id,
      meterNo: alert.meter.meterNo,
      oldBaseline: alert.previousReading,
      newBaseline: dto.newBaselineReading,
      operator: dto.operator,
      resolvedAt: new Date(),
    };
  }

  async createElectricityQuota(dto: any) {
    const zone = await this.prisma.irrigationZone.findUnique({ where: { id: dto.zoneId } });
    if (!zone) throw new NotFoundException('灌溉分区不存在');

    const startDate = dayjs(dto.startDate).startOf('day').toDate();
    const endDate = dayjs(dto.endDate).endOf('day').toDate();

    if (startDate >= endDate) {
      throw new BadRequestException('结束日期必须晚于开始日期');
    }

    const overlap = await this.prisma.electricityQuota.findFirst({
      where: {
        zoneId: dto.zoneId,
        AND: [
          { startDate: { lte: endDate } },
          { endDate: { gte: startDate } },
        ],
      },
    });
    if (overlap) {
      throw new BadRequestException(
        `该分区在[${dto.startDate},${dto.endDate}]时段内已有电量配额,不能重复创建`,
      );
    }

    return this.prisma.electricityQuota.create({
      data: {
        zoneId: dto.zoneId,
        seasonName: dto.seasonName,
        startDate,
        endDate,
        totalKwh: dto.totalKwh,
        operator: dto.operator,
        remark: dto.remark,
      },
      include: {
        zone: { select: { id: true, code: true, name: true } },
      },
    });
  }

  async updateElectricityQuota(quotaId: string, dto: any) {
    const quota = await this.prisma.electricityQuota.findUnique({ where: { id: quotaId } });
    if (!quota) throw new NotFoundException('电量配额不存在');

    if (dto.totalKwh !== undefined && dto.totalKwh < quota.usedKwh) {
      throw new BadRequestException(
        `新配额${dto.totalKwh}度不能小于已用电量${quota.usedKwh.toFixed(2)}度`,
      );
    }

    const updated = await this.prisma.electricityQuota.update({
      where: { id: quotaId },
      data: {
        ...dto,
        blocked: dto.totalKwh !== undefined ? dto.totalKwh <= quota.usedKwh : quota.blocked,
        warningSent: dto.totalKwh !== undefined
          ? quota.usedKwh / dto.totalKwh < QUOTA_WARNING_RATIO ? false : quota.warningSent
          : quota.warningSent,
      },
      include: {
        zone: { select: { id: true, code: true, name: true } },
      },
    });

    return updated;
  }

  async listElectricityQuotas(zoneId?: string) {
    const where: any = {};
    if (zoneId) where.zoneId = zoneId;

    const quotas = await this.prisma.electricityQuota.findMany({
      where,
      include: {
        zone: { select: { id: true, code: true, name: true } },
      },
      orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
    });

    return quotas.map((q) => {
      const usageRatio = q.totalKwh > 0 ? q.usedKwh / q.totalKwh : 0;
      let status: string;
      if (usageRatio >= 1 || q.blocked) status = ElectricityQuotaStatus.EXHAUSTED;
      else if (usageRatio >= QUOTA_WARNING_RATIO) status = ElectricityQuotaStatus.WARNING;
      else status = ElectricityQuotaStatus.NORMAL;

      return {
        ...q,
        usageRatio: +(usageRatio * 100).toFixed(2) + '%',
        remainingKwh: +Math.max(0, q.totalKwh - q.usedKwh).toFixed(2),
        status,
      };
    });
  }

  async getElectricityQuotaUsage(quotaId: string) {
    const quota = await this.prisma.electricityQuota.findUnique({
      where: { id: quotaId },
      include: {
        zone: { select: { id: true, code: true, name: true } },
      },
    });
    if (!quota) throw new NotFoundException('电量配额不存在');

    const records = await this.prisma.electricityExtractionRecord.findMany({
      where: { quotaId },
      include: {
        well: { select: { code: true } },
      },
      orderBy: { recordedAt: 'desc' },
    });

    const usageRatio = quota.totalKwh > 0 ? quota.usedKwh / quota.totalKwh : 0;
    let status: string;
    if (usageRatio >= 1 || quota.blocked) status = ElectricityQuotaStatus.EXHAUSTED;
    else if (usageRatio >= QUOTA_WARNING_RATIO) status = ElectricityQuotaStatus.WARNING;
    else status = ElectricityQuotaStatus.NORMAL;

    const wellStats: Record<string, { wellCode: string; kwh: number; volume: number; count: number }> = {};
    for (const r of records) {
      if (!wellStats[r.wellId]) {
        wellStats[r.wellId] = { wellCode: r.well.code, kwh: 0, volume: 0, count: 0 };
      }
      wellStats[r.wellId].kwh += r.consumptionKwh;
      wellStats[r.wellId].volume += r.waterVolume;
      wellStats[r.wellId].count += 1;
    }

    return {
      quota: {
        id: quota.id,
        seasonName: quota.seasonName,
        startDate: quota.startDate,
        endDate: quota.endDate,
        totalKwh: quota.totalKwh,
        usedKwh: +quota.usedKwh.toFixed(2),
        remainingKwh: +Math.max(0, quota.totalKwh - quota.usedKwh).toFixed(2),
        usageRatio: +(usageRatio * 100).toFixed(2) + '%',
        status,
        warningSent: quota.warningSent,
        blocked: quota.blocked,
      },
      zone: quota.zone,
      recordCount: records.length,
      totalWaterVolume: +records.reduce((s, r) => s + r.waterVolume, 0).toFixed(2),
      wellBreakdown: Object.values(wellStats).map((w) => ({
        wellCode: w.wellCode,
        recordCount: w.count,
        totalKwh: +w.kwh.toFixed(2),
        totalWaterVolume: +w.volume.toFixed(2),
      })),
      recentRecords: records.slice(0, 50).map((r) => ({
        id: r.id,
        wellCode: r.well.code,
        consumptionKwh: r.consumptionKwh,
        waterVolume: r.waterVolume,
        recordedAt: r.recordedAt,
      })),
    };
  }

  async getWellReconciliation(wellId: string, dateFrom?: string, dateTo?: string) {
    const well = await this.prisma.pumpingWell.findUnique({
      where: { id: wellId },
      include: { zone: { select: { id: true, code: true, name: true } } },
    });
    if (!well) throw new NotFoundException('机井不存在');

    const startTime = dateFrom ? dayjs(dateFrom).startOf('day').toDate() : dayjs().startOf('year').toDate();
    const endTime = dateTo ? dayjs(dateTo).endOf('day').toDate() : new Date();

    const extractionRecords = await this.prisma.groundwaterExtractionRecord.findMany({
      where: { wellId, startTime: { gte: startTime, lte: endTime } },
    });

    const electricityRecords = await this.prisma.electricityExtractionRecord.findMany({
      where: { wellId, recordedAt: { gte: startTime, lte: endTime } },
    });

    const estimatedVolume = extractionRecords.reduce((s, r) => s + r.volume, 0);
    const electricVolume = electricityRecords.reduce((s, r) => s + r.waterVolume, 0);
    const totalKwh = electricityRecords.reduce((s, r) => s + r.consumptionKwh, 0);

    let deviationRate: number | null = null;
    let isAbnormal = false;
    if (estimatedVolume > 0) {
      deviationRate = (electricVolume - estimatedVolume) / estimatedVolume;
      isAbnormal = Math.abs(deviationRate) > DEVIATION_ABNORMAL_THRESHOLD;
    }

    return {
      well: {
        id: well.id,
        code: well.code,
        ratedFlow: well.ratedFlow,
        electricityToWaterCoefficient: well.electricityToWaterCoefficient,
        zone: well.zone,
      },
      period: { dateFrom: startTime, dateTo: endTime },
      estimated: {
        totalVolume: +estimatedVolume.toFixed(2),
        recordCount: extractionRecords.length,
        totalHours: +extractionRecords.reduce((s, r) => s + r.durationHours, 0).toFixed(2),
      },
      electric: {
        totalVolume: +electricVolume.toFixed(2),
        totalKwh: +totalKwh.toFixed(2),
        recordCount: electricityRecords.length,
      },
      deviation: estimatedVolume > 0
        ? {
            diffVolume: +(electricVolume - estimatedVolume).toFixed(2),
            deviationRate: +(deviationRate! * 100).toFixed(2) + '%',
            isAbnormal,
            abnormalThreshold: DEVIATION_ABNORMAL_THRESHOLD * 100 + '%',
            suggestion: isAbnormal
              ? '偏差率超过阈值,请校核水泵效率或电表准确度'
              : '两套计量口径偏差在正常范围内',
          }
        : {
            diffVolume: +(electricVolume - estimatedVolume).toFixed(2),
            deviationRate: null,
            isAbnormal: false,
            suggestion: '推算量为0,无法计算偏差率',
          },
    };
  }

  async getZoneReconciliation(zoneId: string, dateFrom?: string, dateTo?: string) {
    const zone = await this.prisma.irrigationZone.findUnique({ where: { id: zoneId } });
    if (!zone) throw new NotFoundException('灌溉分区不存在');

    const startTime = dateFrom ? dayjs(dateFrom).startOf('day').toDate() : dayjs().startOf('year').toDate();
    const endTime = dateTo ? dayjs(dateTo).endOf('day').toDate() : new Date();

    const wells = await this.prisma.pumpingWell.findMany({
      where: { zoneId },
      include: {
        _count: { select: { extractionRecords: true, electricityRecords: true } },
      },
    });

    const wellReports: any[] = [];
    let totalEstimated = 0;
    let totalElectric = 0;
    let abnormalWellCount = 0;

    for (const well of wells) {
      const rec = await this.getWellReconciliation(well.id, dateFrom, dateTo);
      totalEstimated += rec.estimated.totalVolume;
      totalElectric += rec.electric.totalVolume;
      if (rec.deviation.isAbnormal) abnormalWellCount++;

      wellReports.push({
        wellId: well.id,
        wellCode: well.code,
        estimatedVolume: rec.estimated.totalVolume,
        electricVolume: rec.electric.totalVolume,
        deviationRate: rec.deviation.deviationRate,
        isAbnormal: rec.deviation.isAbnormal,
      });
    }

    let deviationRate: number | null = null;
    let isAbnormal = false;
    if (totalEstimated > 0) {
      deviationRate = (totalElectric - totalEstimated) / totalEstimated;
      isAbnormal = Math.abs(deviationRate) > DEVIATION_ABNORMAL_THRESHOLD;
    }

    return {
      zone: {
        id: zone.id,
        code: zone.code,
        name: zone.name,
      },
      period: { dateFrom: startTime, dateTo: endTime },
      summary: {
        wellCount: wells.length,
        abnormalWellCount,
        estimatedTotalVolume: +totalEstimated.toFixed(2),
        electricTotalVolume: +totalElectric.toFixed(2),
        diffVolume: +(totalElectric - totalEstimated).toFixed(2),
        deviationRate: totalEstimated > 0 ? +(deviationRate! * 100).toFixed(2) + '%' : null,
        isAbnormal,
      },
      wellReports: wellReports.sort((a, b) => {
        if (a.isAbnormal && !b.isAbnormal) return -1;
        if (!a.isAbnormal && b.isAbnormal) return 1;
        return 0;
      }),
    };
  }
}
