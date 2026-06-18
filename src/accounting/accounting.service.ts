import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportUsageDto } from './dto';
import dayjs from 'dayjs';
import { ApplicationStatus, ChannelLevel } from '../common/enums';

const LEAKAGE_RATE = 0.05;

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  async reportUsage(dto: ReportUsageDto) {
    const app = await this.prisma.waterApplication.findUnique({
      where: { id: dto.applicationId },
      include: { farmer: true },
    });
    if (!app) throw new NotFoundException('申请不存在');
    if (app.status !== ApplicationStatus.SCHEDULED) {
      throw new BadRequestException('只有已安排(SCHEDULED)状态的申请才能上报实际用水量');
    }

    const deviationRate = (dto.actualVolume - app.requestVolume) / app.requestVolume;
    const isOveruse = dto.actualVolume > app.requestVolume * 1.1;
    const isWaste = dto.actualVolume < app.requestVolume * 0.6;

    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.actualUsage.findUnique({ where: { applicationId: dto.applicationId } });
      let usage;
      if (existing) {
        usage = await tx.actualUsage.update({
          where: { applicationId: dto.applicationId },
          data: {
            actualVolume: dto.actualVolume,
            reportTime: new Date(),
            deviationRate,
            isOveruse,
            isWaste,
          },
        });
      } else {
        usage = await tx.actualUsage.create({
          data: {
            applicationId: dto.applicationId,
            farmerId: app.farmerId,
            actualVolume: dto.actualVolume,
            reportTime: new Date(),
            deviationRate,
            isOveruse,
            isWaste,
          },
        });
      }
      await tx.waterApplication.update({
        where: { id: dto.applicationId },
        data: { status: ApplicationStatus.EXECUTED },
      });
      return { usage, application: app };
    });

    return {
      applicationId: result.application.id,
      farmer: { id: result.application.farmerId, code: result.application.farmer.code, name: result.application.farmer.name },
      plannedVolume: result.application.requestVolume,
      actualVolume: dto.actualVolume,
      deviationRate: +(deviationRate * 100).toFixed(2) + '%',
      isOveruse,
      isWaste,
      evaluation: isOveruse ? '超用(>110%)' : isWaste ? '浪费(<60%)' : '正常',
    };
  }

  async getFarmerDeviationList(dateFrom?: string, dateTo?: string) {
    const where: any = {};
    if (dateFrom || dateTo) {
      const appWhere: any = {};
      if (dateFrom) appWhere.gte = dayjs(dateFrom).startOf('day').toDate();
      if (dateTo) appWhere.lt = dayjs(dateTo).add(1, 'day').startOf('day').toDate();
      where.application = { targetDate: appWhere };
    }

    const usages = await this.prisma.actualUsage.findMany({
      where,
      include: {
        application: { include: { farmer: { select: { code: true, name: true } } } },
      },
      orderBy: { reportTime: 'desc' },
    });

    return usages.map((u) => ({
      id: u.id,
      applicationId: u.applicationId,
      farmerCode: u.application.farmer.code,
      farmerName: u.application.farmer.name,
      plannedVolume: u.application.requestVolume,
      actualVolume: u.actualVolume,
      deviationRate: +(u.deviationRate * 100).toFixed(2),
      isOveruse: u.isOveruse,
      isWaste: u.isWaste,
      evaluation: u.isOveruse ? '超用' : u.isWaste ? '浪费' : '正常',
      reportTime: u.reportTime,
    }));
  }

  async getChannelWaterBalance(dateStr: string) {
    const date = dayjs(dateStr).startOf('day');
    const dayStart = date.hour(0).minute(0);
    const dayEnd = dayStart.add(1, 'day');

    const allocs = await this.prisma.waterAllocation.findMany({
      where: { startTime: { gte: dayStart.toDate(), lt: dayEnd.toDate() } },
      include: {
        channel: { select: { id: true, code: true, name: true, level: true, length: true, parentId: true } },
      },
    });

    const usages = await this.prisma.actualUsage.findMany({
      where: { reportTime: { gte: dayStart.toDate(), lt: dayEnd.toDate() } },
      include: { application: { include: { farmer: { include: { channel: true } } } } },
    });

    const channelVolumes = new Map<string, { supplied: number; distributed: number; actualUsed: number }>();
    for (const alloc of allocs) {
      if (!channelVolumes.has(alloc.channelId)) {
        channelVolumes.set(alloc.channelId, { supplied: 0, distributed: 0, actualUsed: 0 });
      }
      const durationSec = (new Date(alloc.endTime).getTime() - new Date(alloc.startTime).getTime()) / 1000;
      const volume = alloc.flow * durationSec;
      channelVolumes.get(alloc.channelId)!.supplied += volume;
    }

    for (const alloc of allocs) {
      const parentId = alloc.channel.parentId;
      if (parentId && channelVolumes.has(parentId)) {
        const durationSec = (new Date(alloc.endTime).getTime() - new Date(alloc.startTime).getTime()) / 1000;
        const volume = alloc.flow * durationSec;
        channelVolumes.get(parentId)!.distributed += volume;
      }
    }

    for (const u of usages) {
      const chId = u.application.farmer.channelId;
      if (channelVolumes.has(chId)) {
        channelVolumes.get(chId)!.actualUsed += u.actualVolume;
      }
      let pid = u.application.farmer.channel.parentId;
      while (pid) {
        if (channelVolumes.has(pid)) {
          channelVolumes.get(pid)!.actualUsed += u.actualVolume;
        }
        const parent = await this.prisma.channel.findUnique({ where: { id: pid }, select: { parentId: true } });
        pid = parent?.parentId || null;
      }
    }

    const channels = await this.prisma.channel.findMany({
      orderBy: [{ level: 'asc' }, { code: 'asc' }],
    });

    const mainChannel = channels.find((c) => c.level === ChannelLevel.MAIN);
    const mainData = channelVolumes.get(mainChannel?.id || '');
    const totalSupply = mainData?.supplied || 0;
    const totalActualUsed = Array.from(channelVolumes.values()).reduce((sum, v) => sum + (v.actualUsed), 0) / 4;

    return {
      date: dateStr,
      summary: {
        totalInflow: +totalSupply.toFixed(2),
        totalActualUsed: +(Array.from(channelVolumes.values()).filter((_, i) => {
          return i >= 0;
        }).reduce((s, v) => s + v.actualUsed, 0)).toFixed(2),
        estimatedLeakageLoss: +(totalSupply * LEAKAGE_RATE).toFixed(2),
        unaccountedDifference: +Math.max(0, totalSupply - totalActualUsed - totalSupply * LEAKAGE_RATE).toFixed(2),
        leakageRateAssumption: LEAKAGE_RATE * 100 + '%',
      },
      channelDetails: channels.map((ch) => {
        const data = channelVolumes.get(ch.id) || { supplied: 0, distributed: 0, actualUsed: 0 };
        const estimatedLeakage = data.supplied * LEAKAGE_RATE;
        return {
          channel: { id: ch.id, code: ch.code, name: ch.name, level: ch.level, length: ch.length },
          suppliedVolume: +data.supplied.toFixed(2),
          distributedToChildren: +data.distributed.toFixed(2),
          actualUsedByEnd: +data.actualUsed.toFixed(2),
          estimatedLeakageLoss: +estimatedLeakage.toFixed(2),
          balance: +(data.supplied - data.distributed - data.actualUsed - estimatedLeakage).toFixed(2),
        };
      }),
    };
  }

  async getFarmerUsageSummary(farmerId: string, dateFrom?: string, dateTo?: string) {
    const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId } });
    if (!farmer) throw new NotFoundException('用水户不存在');

    const appWhere: any = { farmerId };
    if (dateFrom || dateTo) {
      appWhere.targetDate = {};
      if (dateFrom) appWhere.targetDate.gte = dayjs(dateFrom).startOf('day').toDate();
      if (dateTo) appWhere.targetDate.lt = dayjs(dateTo).add(1, 'day').startOf('day').toDate();
    }

    const apps = await this.prisma.waterApplication.findMany({
      where: appWhere,
      include: {
        allocations: { include: { channel: { select: { code: true, name: true } } } },
        actualUsage: true,
      },
      orderBy: { submitTime: 'desc' },
    });

    let totalPlanned = 0;
    let totalActual = 0;
    let overuseCount = 0;
    let wasteCount = 0;

    const list = apps.map((a) => {
      const usage = a.actualUsage;
      totalPlanned += a.requestVolume;
      if (usage) {
        totalActual += usage.actualVolume;
        if (usage.isOveruse) overuseCount++;
        if (usage.isWaste) wasteCount++;
      }
      return {
        id: a.id,
        targetDate: dayjs(a.targetDate).format('YYYY-MM-DD'),
        status: a.status,
        expectedFlow: a.expectedFlow,
        expectedHours: a.expectedHours,
        plannedVolume: a.requestVolume,
        actualVolume: usage?.actualVolume ?? null,
        deviationRate: usage ? +(usage.deviationRate * 100).toFixed(2) + '%' : null,
        evaluation: usage
          ? usage.isOveruse
            ? '超用'
            : usage.isWaste
            ? '浪费'
            : '正常'
          : usage === null && a.status === ApplicationStatus.SCHEDULED
          ? '待执行'
          : '未执行',
        scheduleSlots: a.allocations.map((al) => ({
          channel: al.channel,
          startTime: al.startTime,
          endTime: al.endTime,
          flow: al.flow,
        })),
      };
    });

    return {
      farmer: { id: farmer.id, code: farmer.code, name: farmer.name, area: farmer.area },
      summary: {
        totalApplications: apps.length,
        scheduledCount: apps.filter((a) => a.status === ApplicationStatus.SCHEDULED).length,
        executedCount: apps.filter((a) => a.status === ApplicationStatus.EXECUTED).length,
        failedCount: apps.filter((a) => a.status === ApplicationStatus.FAILED).length,
        cancelledCount: apps.filter((a) => a.status === ApplicationStatus.CANCELLED_QUOTA).length,
        totalPlannedVolume: +totalPlanned.toFixed(2),
        totalActualVolume: +totalActual.toFixed(2),
        overuseCount,
        wasteCount,
      },
      applications: list,
    };
  }
}
