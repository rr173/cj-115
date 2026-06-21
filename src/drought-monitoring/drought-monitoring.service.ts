import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditRatingService } from '../credit-rating/credit-rating.service';
import { Cron } from '@nestjs/schedule';
import dayjs from 'dayjs';
import {
  DroughtStatus,
  DroughtStatusNames,
  EmergencyLevel,
  EmergencyLevelNames,
  AllocationDroughtStatus,
  AllocationDroughtStatusNames,
  ChannelTransferStatus,
  ChannelTransferStatusNames,
  CreditLevel,
} from '../common/enums';
import {
  ReportWaterSourceDto,
  QueryDroughtEventsDto,
  CreateChannelTransferDto,
  QueryChannelTransfersDto,
  QuerySupplyDemandTrendDto,
} from './dto';

const SLOT_MINUTES = 30;

const CREDIT_REDUCTION_RATES: Record<string, number> = {
  [CreditLevel.A]: 0,
  [CreditLevel.B]: 0.1,
  [CreditLevel.C]: 0.3,
  [CreditLevel.D]: 1.0,
};

const CREDIT_RESTORE_ORDER = [CreditLevel.A, CreditLevel.B, CreditLevel.C, CreditLevel.D];

function ratioToStatus(ratio: number): DroughtStatus {
  if (ratio > 1.2) return DroughtStatus.ABUNDANT;
  if (ratio >= 0.8) return DroughtStatus.NORMAL;
  if (ratio >= 0.5) return DroughtStatus.TENSE;
  return DroughtStatus.SEVERE;
}

@Injectable()
export class DroughtMonitoringService {
  private currentDroughtStatus: DroughtStatus = DroughtStatus.NORMAL;
  private pendingRecovery: boolean = false;
  private latestActualFlow: number = 0;
  private latestDemandFlow: number = 0;
  private latestRatio: number = 1;

  constructor(
    private prisma: PrismaService,
    private creditRatingService: CreditRatingService,
  ) {}

  async reportWaterSource(dto: ReportWaterSourceDto) {
    const channel = await this.prisma.channel.findUnique({ where: { id: dto.channelId } });
    if (!channel) throw new BadRequestException('渠道不存在');

    const reportedAt = dto.reportedAt ? new Date(dto.reportedAt) : new Date();

    const report = await this.prisma.waterSourceReport.create({
      data: {
        channelId: dto.channelId,
        flow: dto.flow,
        reportedAt,
      },
    });

    await this.evaluateDroughtStatus(dto.flow, reportedAt);

    return report;
  }

  private async evaluateDroughtStatus(actualFlow: number, evaluatedAt: Date) {
    const demandFlow = await this.calcCurrentDemandFlow();
    const ratio = demandFlow > 0 ? actualFlow / demandFlow : 1;
    const newStatus = ratioToStatus(ratio);

    this.latestActualFlow = actualFlow;
    this.latestDemandFlow = demandFlow;
    this.latestRatio = ratio;

    const previousStatus = this.currentDroughtStatus;

    if (newStatus !== previousStatus) {
      let emergencyLevel: string | null = null;
      let message = '';

      if (newStatus === DroughtStatus.TENSE) {
        emergencyLevel = EmergencyLevel.LEVEL_1;
        message = `供需比${ratio.toFixed(2)}降至紧张区间,启动一级响应:暂停D级用水户配水计划`;
        this.pendingRecovery = false;
      } else if (newStatus === DroughtStatus.SEVERE) {
        emergencyLevel = EmergencyLevel.LEVEL_2;
        message = `供需比${ratio.toFixed(2)}降至严重缺水区间,启动二级响应:按信用等级削减配水流量`;
        this.pendingRecovery = false;
      } else if (newStatus === DroughtStatus.NORMAL || newStatus === DroughtStatus.ABUNDANT) {
        message = `供需比${ratio.toFixed(2)}恢复至${DroughtStatusNames[newStatus]},将在下一时隙恢复被暂停/削减的配水计划`;
        this.pendingRecovery = true;
      }

      await this.prisma.droughtAlertEvent.create({
        data: {
          level: newStatus,
          previousLevel: previousStatus,
          supplyDemandRatio: ratio,
          actualFlow,
          demandFlow,
          emergencyLevel,
          message,
        },
      });

      this.currentDroughtStatus = newStatus;

      if (newStatus === DroughtStatus.TENSE) {
        await this.executeLevel1Response();
      } else if (newStatus === DroughtStatus.SEVERE) {
        await this.executeLevel2Response();
      }
    } else {
      if ((newStatus === DroughtStatus.NORMAL || newStatus === DroughtStatus.ABUNDANT) && this.pendingRecovery) {
        // already pending, no duplicate
      }
    }

    await this.recordSnapshot(actualFlow, demandFlow, ratio, newStatus, evaluatedAt);
  }

  private async calcCurrentDemandFlow(): Promise<number> {
    const now = new Date();

    const allocations = await this.prisma.waterAllocation.findMany({
      where: {
        endTime: { gt: now },
        droughtStatus: { in: [AllocationDroughtStatus.NORMAL, AllocationDroughtStatus.REDUCED] },
      },
      select: { flow: true },
    });

    return allocations.reduce((sum, a) => sum + a.flow, 0);
  }

  private async recordSnapshot(actualFlow: number, demandFlow: number, ratio: number, status: DroughtStatus, timestamp: Date) {
    const hour = dayjs(timestamp).startOf('hour').toDate();

    await this.prisma.supplyDemandSnapshot.upsert({
      where: { hour },
      create: {
        hour,
        actualFlow,
        demandFlow,
        supplyDemandRatio: ratio,
        droughtStatus: status,
      },
      update: {
        actualFlow,
        demandFlow,
        supplyDemandRatio: ratio,
        droughtStatus: status,
      },
    });
  }

  private async executeLevel1Response() {
    const now = new Date();

    const normalAllocs = await this.prisma.waterAllocation.findMany({
      where: {
        endTime: { gt: now },
        droughtStatus: AllocationDroughtStatus.NORMAL,
      },
      include: {
        application: {
          include: { farmer: { select: { id: true } } },
        },
      },
    });

    const farmerIds = [...new Set(normalAllocs.map((a) => a.application.farmerId))];
    const creditMap = await this.creditRatingService.getFarmerCreditLevelMap(farmerIds);

    for (const alloc of normalAllocs) {
      const creditLevel = creditMap.get(alloc.application.farmerId) || CreditLevel.C;
      if (creditLevel === CreditLevel.D) {
        await this.prisma.waterAllocation.update({
          where: { id: alloc.id },
          data: { droughtStatus: AllocationDroughtStatus.SUSPENDED },
        });
      }
    }
  }

  private async executeLevel2Response() {
    const now = new Date();

    const normalAllocs = await this.prisma.waterAllocation.findMany({
      where: {
        endTime: { gt: now },
        droughtStatus: AllocationDroughtStatus.NORMAL,
      },
      include: {
        application: {
          include: { farmer: { select: { id: true } } },
        },
      },
    });

    const farmerIds = [...new Set(normalAllocs.map((a) => a.application.farmerId))];
    const creditMap = await this.creditRatingService.getFarmerCreditLevelMap(farmerIds);

    for (const alloc of normalAllocs) {
      const creditLevel = creditMap.get(alloc.application.farmerId) || CreditLevel.C;
      const reductionRate = CREDIT_REDUCTION_RATES[creditLevel] ?? 0;

      if (reductionRate >= 1.0) {
        await this.prisma.waterAllocation.update({
          where: { id: alloc.id },
          data: { droughtStatus: AllocationDroughtStatus.SUSPENDED },
        });
      } else if (reductionRate > 0) {
        const reducedFlow = +(alloc.flow * (1 - reductionRate)).toFixed(4);
        await this.prisma.waterAllocation.update({
          where: { id: alloc.id },
          data: {
            droughtStatus: AllocationDroughtStatus.REDUCED,
            originalFlow: alloc.flow,
            flow: reducedFlow,
          },
        });
      }
    }
  }

  @Cron('0 */30 * * * *')
  async processPendingRecovery() {
    if (!this.pendingRecovery) return;
    if (this.currentDroughtStatus !== DroughtStatus.NORMAL && this.currentDroughtStatus !== DroughtStatus.ABUNDANT) {
      this.pendingRecovery = false;
      return;
    }

    await this.restoreAllAllocations();
    this.pendingRecovery = false;
  }

  private async restoreAllAllocations() {
    const now = new Date();

    const suspendedAllocs = await this.prisma.waterAllocation.findMany({
      where: {
        droughtStatus: AllocationDroughtStatus.SUSPENDED,
        endTime: { gt: now },
      },
      include: { application: { select: { farmerId: true } } },
    });

    const reducedAllocs = await this.prisma.waterAllocation.findMany({
      where: {
        droughtStatus: AllocationDroughtStatus.REDUCED,
        endTime: { gt: now },
      },
      include: { application: { select: { farmerId: true } } },
    });

    const allFarmerIds = [
      ...new Set([
        ...suspendedAllocs.map((a) => a.application.farmerId),
        ...reducedAllocs.map((a) => a.application.farmerId),
      ]),
    ];
    const creditMap = await this.creditRatingService.getFarmerCreditLevelMap(allFarmerIds);

    const allAllocs = [
      ...suspendedAllocs.map((a) => ({ id: a.id, type: 'suspended' as const, originalFlow: null, farmerId: a.application.farmerId })),
      ...reducedAllocs.map((a) => ({ id: a.id, type: 'reduced' as const, originalFlow: a.originalFlow, farmerId: a.application.farmerId })),
    ];

    allAllocs.sort((a, b) => {
      const levelA = creditMap.get(a.farmerId) || CreditLevel.C;
      const levelB = creditMap.get(b.farmerId) || CreditLevel.C;
      const orderA = CREDIT_RESTORE_ORDER.indexOf(levelA);
      const orderB = CREDIT_RESTORE_ORDER.indexOf(levelB);
      if (orderA !== orderB) return orderA - orderB;
      return a.id.localeCompare(b.id);
    });

    for (const alloc of allAllocs) {
      if (alloc.type === 'suspended') {
        await this.prisma.waterAllocation.update({
          where: { id: alloc.id },
          data: {
            droughtStatus: AllocationDroughtStatus.NORMAL,
          },
        });
      } else {
        const original = await this.prisma.waterAllocation.findUnique({ where: { id: alloc.id } });
        if (original && original.originalFlow !== null) {
          await this.prisma.waterAllocation.update({
            where: { id: alloc.id },
            data: {
              droughtStatus: AllocationDroughtStatus.NORMAL,
              flow: original.originalFlow,
              originalFlow: null,
            },
          });
        }
      }
    }

    await this.releaseAllChannelTransfers();
  }

  async getStatus() {
    return {
      supplyDemandRatio: +this.latestRatio.toFixed(4),
      droughtStatus: this.currentDroughtStatus,
      droughtStatusName: DroughtStatusNames[this.currentDroughtStatus],
      actualFlow: this.latestActualFlow,
      demandFlow: this.latestDemandFlow,
      emergencyLevel:
        this.currentDroughtStatus === DroughtStatus.SEVERE
          ? EmergencyLevel.LEVEL_2
          : this.currentDroughtStatus === DroughtStatus.TENSE
            ? EmergencyLevel.LEVEL_1
            : null,
      emergencyLevelName:
        this.currentDroughtStatus === DroughtStatus.SEVERE
          ? EmergencyLevelNames[EmergencyLevel.LEVEL_2]
          : this.currentDroughtStatus === DroughtStatus.TENSE
            ? EmergencyLevelNames[EmergencyLevel.LEVEL_1]
            : null,
      pendingRecovery: this.pendingRecovery,
    };
  }

  async getDroughtEvents(dto: QueryDroughtEventsDto) {
    const where: any = {};
    if (dto.level) where.level = dto.level;
    if (dto.startTime || dto.endTime) {
      where.createdAt = {};
      if (dto.startTime) where.createdAt.gte = new Date(dto.startTime);
      if (dto.endTime) where.createdAt.lte = new Date(dto.endTime);
    }

    const events = await this.prisma.droughtAlertEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return events.map((e) => ({
      id: e.id,
      level: e.level,
      levelName: DroughtStatusNames[e.level as DroughtStatus] || e.level,
      previousLevel: e.previousLevel,
      previousLevelName: e.previousLevel ? DroughtStatusNames[e.previousLevel as DroughtStatus] || e.previousLevel : null,
      supplyDemandRatio: e.supplyDemandRatio,
      actualFlow: e.actualFlow,
      demandFlow: e.demandFlow,
      emergencyLevel: e.emergencyLevel,
      emergencyLevelName: e.emergencyLevel ? EmergencyLevelNames[e.emergencyLevel as EmergencyLevel] || e.emergencyLevel : null,
      message: e.message,
      createdAt: e.createdAt,
    }));
  }

  async getAffectedAllocations() {
    const now = new Date();

    const suspended = await this.prisma.waterAllocation.findMany({
      where: {
        droughtStatus: AllocationDroughtStatus.SUSPENDED,
        endTime: { gt: now },
      },
      include: {
        application: {
          include: { farmer: { select: { id: true, code: true, name: true } } },
        },
        channel: { select: { id: true, code: true, name: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    const reduced = await this.prisma.waterAllocation.findMany({
      where: {
        droughtStatus: AllocationDroughtStatus.REDUCED,
        endTime: { gt: now },
      },
      include: {
        application: {
          include: { farmer: { select: { id: true, code: true, name: true } } },
        },
        channel: { select: { id: true, code: true, name: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    return {
      suspended: suspended.map((a) => ({
        id: a.id,
        applicationId: a.applicationId,
        farmer: {
          id: a.application.farmer.id,
          code: a.application.farmer.code,
          name: a.application.farmer.name,
        },
        channel: a.channel,
        startTime: a.startTime,
        endTime: a.endTime,
        flow: a.flow,
        droughtStatus: a.droughtStatus,
        droughtStatusName: AllocationDroughtStatusNames[a.droughtStatus as AllocationDroughtStatus],
      })),
      reduced: reduced.map((a) => ({
        id: a.id,
        applicationId: a.applicationId,
        farmer: {
          id: a.application.farmer.id,
          code: a.application.farmer.code,
          name: a.application.farmer.name,
        },
        channel: a.channel,
        startTime: a.startTime,
        endTime: a.endTime,
        originalFlow: a.originalFlow,
        reducedFlow: a.flow,
        reductionAmount: a.originalFlow !== null ? +(a.originalFlow - a.flow).toFixed(4) : null,
        droughtStatus: a.droughtStatus,
        droughtStatusName: AllocationDroughtStatusNames[a.droughtStatus as AllocationDroughtStatus],
      })),
    };
  }

  async manualTriggerEmergency() {
    const now = new Date();
    const demandFlow = await this.calcCurrentDemandFlow();
    const actualFlow = this.latestActualFlow || 0;
    const ratio = demandFlow > 0 ? actualFlow / demandFlow : 1;
    const status = ratioToStatus(ratio);

    if (status !== DroughtStatus.TENSE && status !== DroughtStatus.SEVERE) {
      throw new BadRequestException(`当前供需比${ratio.toFixed(2)}为${DroughtStatusNames[status]},无需触发应急响应`);
    }

    const previousStatus = this.currentDroughtStatus;
    let emergencyLevel: string;
    let message: string;

    if (status === DroughtStatus.SEVERE) {
      emergencyLevel = EmergencyLevel.LEVEL_2;
      message = `手动触发二级响应:供需比${ratio.toFixed(2)},按信用等级削减配水流量`;
      this.currentDroughtStatus = DroughtStatus.SEVERE;
      await this.executeLevel2Response();
    } else {
      emergencyLevel = EmergencyLevel.LEVEL_1;
      message = `手动触发一级响应:供需比${ratio.toFixed(2)},暂停D级用水户配水计划`;
      this.currentDroughtStatus = DroughtStatus.TENSE;
      await this.executeLevel1Response();
    }

    await this.prisma.droughtAlertEvent.create({
      data: {
        level: this.currentDroughtStatus,
        previousLevel: previousStatus,
        supplyDemandRatio: ratio,
        actualFlow,
        demandFlow,
        emergencyLevel,
        message,
      },
    });

    return {
      triggered: true,
      emergencyLevel,
      emergencyLevelName: EmergencyLevelNames[emergencyLevel as EmergencyLevel],
      supplyDemandRatio: ratio,
      droughtStatus: this.currentDroughtStatus,
      droughtStatusName: DroughtStatusNames[this.currentDroughtStatus],
    };
  }

  async manualLiftEmergency() {
    const previousStatus = this.currentDroughtStatus;

    if (previousStatus === DroughtStatus.NORMAL || previousStatus === DroughtStatus.ABUNDANT) {
      throw new BadRequestException('当前未处于应急状态,无需解除');
    }

    await this.restoreAllAllocations();

    this.currentDroughtStatus = DroughtStatus.NORMAL;
    this.pendingRecovery = false;

    await this.prisma.droughtAlertEvent.create({
      data: {
        level: DroughtStatus.NORMAL,
        previousLevel: previousStatus,
        supplyDemandRatio: this.latestRatio,
        actualFlow: this.latestActualFlow,
        demandFlow: this.latestDemandFlow,
        message: `手动解除应急状态,所有被暂停和削减的配水计划已恢复`,
      },
    });

    return {
      lifted: true,
      previousStatus,
      previousStatusName: DroughtStatusNames[previousStatus],
      currentStatus: DroughtStatus.NORMAL,
      currentStatusName: DroughtStatusNames[DroughtStatus.NORMAL],
    };
  }

  async createChannelTransfer(dto: CreateChannelTransferDto) {
    if (dto.sourceChannelId === dto.targetChannelId) {
      throw new BadRequestException('借出渠道和借入渠道不能相同');
    }

    if (this.currentDroughtStatus !== DroughtStatus.TENSE && this.currentDroughtStatus !== DroughtStatus.SEVERE) {
      throw new BadRequestException('当前旱情状态不允许渠道借调,仅在紧张或严重缺水时可借调');
    }

    const sourceChannel = await this.prisma.channel.findUnique({ where: { id: dto.sourceChannelId } });
    if (!sourceChannel) throw new BadRequestException('借出渠道不存在');

    const targetChannel = await this.prisma.channel.findUnique({ where: { id: dto.targetChannelId } });
    if (!targetChannel) throw new BadRequestException('借入渠道不存在');

    const existingSourceTransfer = await this.prisma.channelTransfer.findFirst({
      where: {
        sourceChannelId: dto.sourceChannelId,
        status: ChannelTransferStatus.ACTIVE,
      },
    });
    if (existingSourceTransfer) {
      throw new BadRequestException('该渠道已有活跃的借调关系,同一条渠道不能同时借给两个对象');
    }

    const now = new Date();

    const activeAllocs = await this.prisma.waterAllocation.findFirst({
      where: {
        channelId: dto.sourceChannelId,
        endTime: { gt: now },
        droughtStatus: { not: AllocationDroughtStatus.SUSPENDED },
      },
    });
    if (activeAllocs) {
      throw new BadRequestException('借出渠道不是空闲渠道,存在正在执行的配水计划');
    }

    if (dto.transferredCapacity > sourceChannel.maxFlow) {
      throw new BadRequestException(`借调容量${dto.transferredCapacity}超过借出渠道设计容量${sourceChannel.maxFlow}`);
    }

    const transfer = await this.prisma.channelTransfer.create({
      data: {
        sourceChannelId: dto.sourceChannelId,
        targetChannelId: dto.targetChannelId,
        transferredCapacity: dto.transferredCapacity,
        status: ChannelTransferStatus.ACTIVE,
      },
      include: {
        sourceChannel: { select: { id: true, code: true, name: true, maxFlow: true } },
        targetChannel: { select: { id: true, code: true, name: true, maxFlow: true } },
      },
    });

    return {
      id: transfer.id,
      sourceChannel: transfer.sourceChannel,
      targetChannel: transfer.targetChannel,
      transferredCapacity: transfer.transferredCapacity,
      status: transfer.status,
      statusName: ChannelTransferStatusNames[transfer.status as ChannelTransferStatus],
      createdAt: transfer.createdAt,
    };
  }

  async getChannelTransfers(dto: QueryChannelTransfersDto) {
    const where: any = {};
    if (dto.status) where.status = dto.status;

    const transfers = await this.prisma.channelTransfer.findMany({
      where,
      include: {
        sourceChannel: { select: { id: true, code: true, name: true, maxFlow: true } },
        targetChannel: { select: { id: true, code: true, name: true, maxFlow: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return transfers.map((t) => ({
      id: t.id,
      sourceChannel: t.sourceChannel,
      targetChannel: t.targetChannel,
      transferredCapacity: t.transferredCapacity,
      status: t.status,
      statusName: ChannelTransferStatusNames[t.status as ChannelTransferStatus],
      createdAt: t.createdAt,
      releasedAt: t.releasedAt,
    }));
  }

  private async releaseAllChannelTransfers() {
    const activeTransfers = await this.prisma.channelTransfer.findMany({
      where: { status: ChannelTransferStatus.ACTIVE },
    });

    for (const t of activeTransfers) {
      await this.prisma.channelTransfer.update({
        where: { id: t.id },
        data: {
          status: ChannelTransferStatus.RELEASED,
          releasedAt: new Date(),
        },
      });
    }
  }

  async getSupplyDemandTrend(dto: QuerySupplyDemandTrendDto) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    const snapshots = await this.prisma.supplyDemandSnapshot.findMany({
      where: {
        hour: { gte: start, lte: end },
      },
      orderBy: { hour: 'asc' },
    });

    return {
      startTime: dto.startTime,
      endTime: dto.endTime,
      data: snapshots.map((s) => ({
        hour: s.hour,
        actualFlow: s.actualFlow,
        demandFlow: s.demandFlow,
        supplyDemandRatio: +s.supplyDemandRatio.toFixed(4),
        droughtStatus: s.droughtStatus,
        droughtStatusName: DroughtStatusNames[s.droughtStatus as DroughtStatus] || s.droughtStatus,
      })),
    };
  }

  async getChannelEffectiveCapacity(channelId: string) {
    const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) throw new NotFoundException('渠道不存在');

    let effectiveCapacity = channel.maxFlow;

    const incomingTransfers = await this.prisma.channelTransfer.findMany({
      where: {
        targetChannelId: channelId,
        status: ChannelTransferStatus.ACTIVE,
      },
    });

    for (const t of incomingTransfers) {
      effectiveCapacity += t.transferredCapacity;
    }

    return {
      channelId,
      channelCode: channel.code,
      channelName: channel.name,
      designCapacity: channel.maxFlow,
      borrowedCapacity: incomingTransfers.reduce((s, t) => s + t.transferredCapacity, 0),
      effectiveCapacity,
    };
  }
}
