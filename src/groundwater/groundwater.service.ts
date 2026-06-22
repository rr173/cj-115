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
} from '../common/enums';

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
}
