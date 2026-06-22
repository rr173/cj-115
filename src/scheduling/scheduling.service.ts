import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelService } from '../channel/channel.service';
import { CreditRatingService } from '../credit-rating/credit-rating.service';
import dayjs from 'dayjs';
import { ApplicationStatus, CreditLevel, CreditLevelSortOrder, NotificationType, EmergencyApprovalStatus } from '../common/enums';

const SLOT_MINUTES = 30;
const MAX_DELAY_HOURS = 4;
const MAX_DELAY_SLOTS = (MAX_DELAY_HOURS * 60) / SLOT_MINUTES;

interface ChannelSlot {
  [slotIndex: number]: number;
}

@Injectable()
export class SchedulingService {
  constructor(
    private prisma: PrismaService,
    private channelService: ChannelService,
    private creditRatingService: CreditRatingService,
  ) {}

  private roundToNextSlot(date: dayjs.Dayjs): dayjs.Dayjs {
    const minutes = date.minute();
    const remainder = minutes % SLOT_MINUTES;
    if (remainder === 0) return date;
    return date.add(SLOT_MINUTES - remainder, 'minute');
  }

  private timeToSlotIndex(base: dayjs.Dayjs, time: dayjs.Dayjs): number {
    return Math.floor(time.diff(base, 'minute') / SLOT_MINUTES);
  }

  private slotIndexToTime(base: dayjs.Dayjs, index: number): dayjs.Dayjs {
    return base.add(index * SLOT_MINUTES, 'minute');
  }

  private buildSlotMap(
    allocations: Array<{ channelId: string; startTime: Date; endTime: Date; flow: number }>,
    baseTime: dayjs.Dayjs,
    dayEnd: dayjs.Dayjs,
  ): Map<string, ChannelSlot> {
    const slotMap = new Map<string, ChannelSlot>();
    const totalSlots = this.timeToSlotIndex(baseTime, dayEnd);

    for (const alloc of allocations) {
      const startIdx = Math.max(0, this.timeToSlotIndex(baseTime, dayjs(alloc.startTime)));
      const endIdx = Math.min(totalSlots, this.timeToSlotIndex(baseTime, dayjs(alloc.endTime)));
      if (!slotMap.has(alloc.channelId)) {
        slotMap.set(alloc.channelId, {});
      }
      const chSlots = slotMap.get(alloc.channelId)!;
      for (let i = startIdx; i < endIdx; i++) {
        chSlots[i] = (chSlots[i] || 0) + alloc.flow;
      }
    }
    return slotMap;
  }

  private checkCapacity(
    slotMap: Map<string, ChannelSlot>,
    channelId: string,
    channelMaxFlow: number,
    startSlot: number,
    endSlot: number,
    addFlow: number,
  ): number | null {
    const slots = slotMap.get(channelId) || {};
    for (let i = startSlot; i < endSlot; i++) {
      const used = slots[i] || 0;
      if (used + addFlow > channelMaxFlow) {
        return i;
      }
    }
    return null;
  }

  private addFlowToSlots(
    slotMap: Map<string, ChannelSlot>,
    channelId: string,
    startSlot: number,
    endSlot: number,
    addFlow: number,
  ) {
    if (!slotMap.has(channelId)) {
      slotMap.set(channelId, {});
    }
    const slots = slotMap.get(channelId)!;
    for (let i = startSlot; i < endSlot; i++) {
      slots[i] = (slots[i] || 0) + addFlow;
    }
  }

  async runScheduling(targetDateStr: string) {
    const targetDate = dayjs(targetDateStr).startOf('day');
    if (!targetDate.isValid()) throw new BadRequestException('日期格式错误');

    const dayStart = targetDate.hour(0).minute(0).second(0);
    const dayEnd = dayStart.add(1, 'day');
    const totalSlots = this.timeToSlotIndex(dayStart, dayEnd);

    const existingAllocs = await this.prisma.waterAllocation.findMany({
      where: {
        startTime: { gte: dayStart.toDate(), lt: dayEnd.toDate() },
      },
    });

    const slotMap = this.buildSlotMap(existingAllocs, dayStart, dayEnd);

    const pendingApps = await this.prisma.waterApplication.findMany({
      where: {
        targetDate: { gte: dayStart.toDate(), lt: dayEnd.toDate() },
        status: { in: [ApplicationStatus.PENDING, ApplicationStatus.FAILED, ApplicationStatus.POSTPONED] },
      },
      include: { farmer: { include: { channel: true } } },
      orderBy: { submitTime: 'asc' },
    });

    const emergencyApps = pendingApps.filter((a) => a.isEmergency);
    const normalApps = pendingApps.filter((a) => !a.isEmergency);

    emergencyApps.sort((a, b) => new Date(a.submitTime).getTime() - new Date(b.submitTime).getTime());

    const farmerIds = [...new Set(normalApps.map((a) => a.farmerId))];
    const creditLevelMap = await this.creditRatingService.getFarmerCreditLevelMap(farmerIds);

    normalApps.sort((a, b) => {
      const levelA = creditLevelMap.get(a.farmerId) || CreditLevel.C;
      const levelB = creditLevelMap.get(b.farmerId) || CreditLevel.C;
      const orderA = CreditLevelSortOrder[levelA];
      const orderB = CreditLevelSortOrder[levelB];
      if (orderA !== orderB) return orderA - orderB;
      return new Date(a.submitTime).getTime() - new Date(b.submitTime).getTime();
    });

    const sortedApps = [...emergencyApps, ...normalApps];

    const results: any[] = [];

    for (const app of sortedApps) {
      if (!app.isEmergency) {
        const appCreditLevel = creditLevelMap.get(app.farmerId) || CreditLevel.C;
        if (appCreditLevel === CreditLevel.D) {
          const dCheck = await this.creditRatingService.checkDFarmerCanApply(app.farmerId);
          if (!dCheck.canApply) {
            await this.prisma.waterApplication.update({
              where: { id: app.id },
              data: {
                status: ApplicationStatus.FAILED_FINAL,
                failReason: dCheck.reason,
              },
            });
            results.push({
              applicationId: app.id,
              farmerCode: app.farmer.code,
              status: 'REJECTED',
              failReason: dCheck.reason,
            });
            continue;
          }
        }
      }

      const path = await this.channelService.getPathToRoot(app.farmer.channelId);
      const durationSlots = Math.ceil((app.expectedHours * 60) / SLOT_MINUTES);

      let scheduled = false;
      let failReason: string | null = null;
      let conflictChannelId: string | null = null;
      let conflictStart: Date | null = null;
      let conflictEnd: Date | null = null;

      let earliestStart = dayStart.hour(6).minute(0);
      earliestStart = this.roundToNextSlot(earliestStart);

      for (let delayStep = 0; delayStep <= MAX_DELAY_SLOTS; delayStep++) {
        const farmerStart = earliestStart.add(delayStep * SLOT_MINUTES, 'minute');
        const farmerStartSlot = this.timeToSlotIndex(dayStart, farmerStart);
        const farmerEndSlot = farmerStartSlot + durationSlots;

        if (farmerEndSlot > totalSlots) {
          failReason = '超出当日可用时间范围';
          break;
        }

        let allOk = true;
        let cumulativeDelay = 0;
        let failedChannel: any = null;
        let failedSlot: number | null = null;

        for (const ch of path) {
          cumulativeDelay += ch.propagationDelay;
          const chStart = farmerStart.subtract(cumulativeDelay, 'minute');
          const chStartSlot = this.timeToSlotIndex(dayStart, chStart);
          const chEndSlot = chStartSlot + durationSlots;

          if (chStartSlot < 0) {
            failedChannel = ch;
            failedSlot = 0;
            allOk = false;
            break;
          }

          const conflict = this.checkCapacity(
            slotMap,
            ch.id,
            ch.maxFlow,
            chStartSlot,
            chEndSlot,
            app.expectedFlow,
          );
          if (conflict !== null) {
            failedChannel = ch;
            failedSlot = conflict;
            allOk = false;
            break;
          }
        }

        if (allOk) {
          const allocations: any[] = [];
          let cumDelay = 0;
          for (const ch of path) {
            cumDelay += ch.propagationDelay;
            const chStart = farmerStart.subtract(cumDelay, 'minute');
            const chStartSlot = this.timeToSlotIndex(dayStart, chStart);
            const chEndSlot = chStartSlot + durationSlots;

            this.addFlowToSlots(slotMap, ch.id, chStartSlot, chEndSlot, app.expectedFlow);

            allocations.push({
              applicationId: app.id,
              channelId: ch.id,
              startTime: this.slotIndexToTime(dayStart, chStartSlot).toDate(),
              endTime: this.slotIndexToTime(dayStart, chEndSlot).toDate(),
              flow: app.expectedFlow,
            });
          }

          await this.prisma.$transaction(async (tx) => {
            await tx.waterAllocation.deleteMany({ where: { applicationId: app.id } });
            for (const alloc of allocations) {
              await tx.waterAllocation.create({ data: alloc });
            }
            const updateData: any = {
              status: ApplicationStatus.SCHEDULED,
              failReason: null,
              conflictChannelId: null,
              conflictStartTime: null,
              conflictEndTime: null,
            };
            if (app.isEmergency) {
              updateData.emergencyApprovalStatus = EmergencyApprovalStatus.PENDING_APPROVAL;
            }
            await tx.waterApplication.update({
              where: { id: app.id },
              data: updateData,
            });
          });

          scheduled = true;
          results.push({
            applicationId: app.id,
            farmerCode: app.farmer.code,
            status: 'SCHEDULED',
            farmerStartTime: farmerStart.format('YYYY-MM-DD HH:mm'),
            farmerEndTime: farmerStart.add(app.expectedHours, 'hour').format('YYYY-MM-DD HH:mm'),
            flow: app.expectedFlow,
            volume: app.requestVolume,
            allocations,
          });
          break;
        } else if (failedChannel && failedSlot !== null) {
          conflictChannelId = failedChannel.id;
          conflictStart = this.slotIndexToTime(dayStart, failedSlot).toDate();
          conflictEnd = this.slotIndexToTime(dayStart, failedSlot + 1).toDate();
        }
      }

      if (!scheduled) {
        if (!failReason) {
          failReason = '本日无法安排,推迟4小时内均无法找到可行时段';
        }

        if (app.isEmergency) {
          await this.prisma.$transaction(async (tx) => {
            await tx.waterApplication.update({
              where: { id: app.id },
              data: {
                status: ApplicationStatus.FAILED_FINAL,
                failReason: `紧急申请编排失败: ${failReason},请管理员人工介入处理`,
                conflictChannelId,
                conflictStartTime: conflictStart,
                conflictEndTime: conflictEnd,
              },
            });

            await tx.notification.create({
              data: {
                farmerId: app.farmerId,
                applicationId: app.id,
                type: NotificationType.EMERGENCY_ALERT,
                title: '紧急申请编排失败告警',
                content: `紧急用水申请（申请ID: ${app.id.substring(0, 8)}）因渠道容量不足，无法在${targetDateStr}安排，已标记为失败，请管理员立即人工介入处理。用水户: ${app.farmer.code}(${app.farmer.name}), 原因: ${app.emergencyReason}, 申请水量: ${app.requestVolume.toFixed(2)}m³`,
              },
            });
          });

          const ch = conflictChannelId ? await this.prisma.channel.findUnique({ where: { id: conflictChannelId } }) : null;
          results.push({
            applicationId: app.id,
            farmerCode: app.farmer.code,
            status: 'EMERGENCY_FAILED',
            failReason: `紧急申请编排失败: ${failReason},已通知管理员人工介入`,
            conflictChannel: ch ? { id: ch.id, code: ch.code, name: ch.name } : null,
            conflictTime: conflictStart ? dayjs(conflictStart).format('YYYY-MM-DD HH:mm') + ' ~ ' + dayjs(conflictEnd).format('HH:mm') : null,
            requestedFlow: app.expectedFlow,
            isEmergency: true,
            emergencyReason: app.emergencyReason,
          });
        } else {
          await this.prisma.waterApplication.update({
            where: { id: app.id },
            data: {
              status: ApplicationStatus.FAILED,
              failReason,
              conflictChannelId,
              conflictStartTime: conflictStart,
              conflictEndTime: conflictEnd,
            },
          });
          const ch = conflictChannelId ? await this.prisma.channel.findUnique({ where: { id: conflictChannelId } }) : null;
          results.push({
            applicationId: app.id,
            farmerCode: app.farmer.code,
            status: 'FAILED',
            failReason,
            conflictChannel: ch ? { id: ch.id, code: ch.code, name: ch.name } : null,
            conflictTime: conflictStart ? dayjs(conflictStart).format('YYYY-MM-DD HH:mm') + ' ~ ' + dayjs(conflictEnd).format('HH:mm') : null,
            requestedFlow: app.expectedFlow,
          });
        }
      }
    }

    return {
      targetDate: targetDateStr,
      totalProcessed: sortedApps.length,
      scheduled: results.filter((r) => r.status === 'SCHEDULED').length,
      failed: results.filter((r) => r.status === 'FAILED' || r.status === 'EMERGENCY_FAILED').length,
      emergencyScheduled: results.filter((r) => r.status === 'SCHEDULED' && emergencyApps.find((e) => e.id === r.applicationId)).length,
      emergencyFailed: results.filter((r) => r.status === 'EMERGENCY_FAILED').length,
      details: results,
    };
  }

  async getChannelSchedule(channelId: string, dateStr: string) {
    const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) throw new BadRequestException('渠道不存在');

    const date = dayjs(dateStr).startOf('day');
    const dayStart = date.hour(0).minute(0);
    const dayEnd = dayStart.add(1, 'day');

    const allocs = await this.prisma.waterAllocation.findMany({
      where: {
        channelId,
        startTime: { gte: dayStart.toDate(), lt: dayEnd.toDate() },
      },
      include: {
        application: {
          include: { farmer: { select: { id: true, code: true, name: true } } },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const totalSlots = 48;
    const slots: Array<{
      slotIndex: number;
      timeRange: string;
      allocatedFlow: number;
      remainingCapacity: number;
      maxFlow: number;
      servingApplications: Array<{ appId: string; farmerCode: string; flow: number }>;
    }> = [];

    for (let i = 0; i < totalSlots; i++) {
      const slotStart = dayStart.add(i * SLOT_MINUTES, 'minute');
      const slotEnd = slotStart.add(SLOT_MINUTES, 'minute');
      let allocated = 0;
      const serving: Array<{ appId: string; farmerCode: string; flow: number }> = [];

      for (const alloc of allocs) {
        const aStart = dayjs(alloc.startTime);
        const aEnd = dayjs(alloc.endTime);
        if (aStart.isBefore(slotEnd) && aEnd.isAfter(slotStart)) {
          allocated += alloc.flow;
          serving.push({
            appId: alloc.applicationId,
            farmerCode: alloc.application.farmer.code,
            flow: alloc.flow,
          });
        }
      }

      slots.push({
        slotIndex: i,
        timeRange: slotStart.format('HH:mm') + ' - ' + slotEnd.format('HH:mm'),
        allocatedFlow: +allocated.toFixed(4),
        remainingCapacity: +(channel.maxFlow - allocated).toFixed(4),
        maxFlow: channel.maxFlow,
        servingApplications: serving,
      });
    }

    return {
      channel: { id: channel.id, code: channel.code, name: channel.name, maxFlow: channel.maxFlow },
      date: dateStr,
      timeSlots: slots,
      allAllocations: allocs.map((a) => ({
        id: a.id,
        startTime: a.startTime,
        endTime: a.endTime,
        flow: a.flow,
        application: {
          id: a.applicationId,
          farmerCode: a.application.farmer.code,
          farmerName: a.application.farmer.name,
        },
      })),
    };
  }

  async getDaySchedule(dateStr: string) {
    const date = dayjs(dateStr).startOf('day');
    const dayStart = date.hour(0).minute(0);
    const dayEnd = dayStart.add(1, 'day');

    const allocs = await this.prisma.waterAllocation.findMany({
      where: { startTime: { gte: dayStart.toDate(), lt: dayEnd.toDate() } },
      include: {
        channel: { select: { id: true, code: true, name: true, level: true } },
        application: {
          include: { farmer: { select: { id: true, code: true, name: true } } },
        },
      },
      orderBy: [{ channelId: 'asc' }, { startTime: 'asc' }],
    });

    const byChannel = new Map<string, any[]>();
    for (const alloc of allocs) {
      const key = alloc.channelId;
      if (!byChannel.has(key)) byChannel.set(key, []);
      byChannel.get(key)!.push({
        id: alloc.id,
        startTime: alloc.startTime,
        endTime: alloc.endTime,
        flow: alloc.flow,
        application: {
          id: alloc.applicationId,
          farmerCode: alloc.application.farmer.code,
          farmerName: alloc.application.farmer.name,
          requestVolume: alloc.application.requestVolume,
        },
      });
    }

    const channels = await this.prisma.channel.findMany({ orderBy: [{ level: 'asc' }, { code: 'asc' }] });
    const result = channels.map((ch) => ({
      channel: { id: ch.id, code: ch.code, name: ch.name, level: ch.level, maxFlow: ch.maxFlow },
      allocations: byChannel.get(ch.id) || [],
    }));

    const apps = await this.prisma.waterApplication.findMany({
      where: { targetDate: { gte: dayStart.toDate(), lt: dayEnd.toDate() } },
      orderBy: { submitTime: 'asc' },
      include: { farmer: { select: { code: true, name: true } } },
    });

    return {
      date: dateStr,
      channelSchedules: result,
      applicationSummary: apps.map((a) => ({
        id: a.id,
        farmerCode: a.farmer.code,
        farmerName: a.farmer.name,
        expectedFlow: a.expectedFlow,
        expectedHours: a.expectedHours,
        requestVolume: a.requestVolume,
        status: a.status,
        failReason: a.failReason,
        submitTime: a.submitTime,
      })),
    };
  }
}
