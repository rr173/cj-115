import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SchedulingService } from './scheduling.service';
import dayjs from 'dayjs';
import { ApplicationStatus, MaintenanceOrderStatus, NotificationType, EmergencyApprovalStatus } from '../common/enums';

const MAX_POSTPONE_DAYS = 3;

@Injectable()
export class AutoSchedulingService {
  private readonly logger = new Logger(AutoSchedulingService.name);

  constructor(
    private prisma: PrismaService,
    private schedulingService: SchedulingService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'daily-auto-scheduling',
    timeZone: 'Asia/Shanghai',
  })
  async handleDailyScheduling() {
    this.logger.log('开始执行每日自动配水编排任务');
    const today = dayjs().format('YYYY-MM-DD');

    try {
      await this.processFailedApplications();

      const result = await this.schedulingService.runScheduling(today);
      this.logger.log(
        `自动编排完成: 日期=${today}, 处理=${result.totalProcessed}, 成功=${result.scheduled}, 失败=${result.failed}`,
      );

      await this.handlePostponementForFailedApps(today);

      this.logger.log('每日自动配水编排任务执行完成');
      return result;
    } catch (error) {
      this.logger.error(`自动编排任务执行失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async processFailedApplications() {
    this.logger.log('处理前一天顺延的申请');
    const yesterday = dayjs().subtract(1, 'day').startOf('day');
    const today = dayjs().startOf('day');

    const postponedApps = await this.prisma.waterApplication.findMany({
      where: {
        status: ApplicationStatus.POSTPONED,
        targetDate: {
          gte: yesterday.toDate(),
          lt: today.toDate(),
        },
      },
      include: { farmer: true },
    });

    for (const app of postponedApps) {
      await this.prisma.waterApplication.update({
        where: { id: app.id },
        data: { status: ApplicationStatus.PENDING },
      });
    }

    this.logger.log(`已将 ${postponedApps.length} 个顺延申请重置为待编排状态`);
  }

  private async handlePostponementForFailedApps(dateStr: string) {
    this.logger.log('处理编排失败的申请，执行自动顺延');

    const targetDate = dayjs(dateStr).startOf('day');
    const dayStart = targetDate.hour(0).minute(0);
    const dayEnd = dayStart.add(1, 'day');

    const failedApps = await this.prisma.waterApplication.findMany({
      where: {
        targetDate: { gte: dayStart.toDate(), lt: dayEnd.toDate() },
        status: ApplicationStatus.FAILED,
        isEmergency: false,
      },
      include: { farmer: { include: { channel: true } } },
    });

    this.logger.log(`发现 ${failedApps.length} 个编排失败的申请需要处理`);

    const results: any[] = [];

    for (const app of failedApps) {
      const result = await this.tryPostponeApplication(app, targetDate);
      results.push(result);
    }

    const postponedCount = results.filter((r) => r.action === 'postponed').length;
    const finalFailedCount = results.filter((r) => r.action === 'final_failed').length;

    this.logger.log(`顺延处理完成: 顺延=${postponedCount}, 最终失败=${finalFailedCount}`);

    return {
      totalProcessed: failedApps.length,
      postponed: postponedCount,
      finalFailed: finalFailedCount,
      details: results,
    };
  }

  private async tryPostponeApplication(
    app: any,
    currentTargetDate: dayjs.Dayjs,
  ): Promise<{ applicationId: string; action: string; newTargetDate?: string; reason?: string }> {
    if (app.postponeCount >= MAX_POSTPONE_DAYS) {
      await this.markAsFinalFailed(app);
      return {
        applicationId: app.id,
        action: 'final_failed',
        reason: `已连续顺延${MAX_POSTPONE_DAYS}天仍无法安排，最终失败`,
      };
    }

    const nextAvailableDate = await this.findNextAvailableDate(
      app.farmer.channelId,
      currentTargetDate.add(1, 'day'),
    );

    if (!nextAvailableDate) {
      await this.markAsFinalFailed(app);
      return {
        applicationId: app.id,
        action: 'final_failed',
        reason: '无法找到可用的顺延日期，最终失败',
      };
    }

    const daysDiff = nextAvailableDate.diff(currentTargetDate, 'day');
    let reason = `本日编排失败，顺延至${nextAvailableDate.format('YYYY-MM-DD')}`;

    if (daysDiff > 1) {
      reason += `（跳过${daysDiff - 1}天渠道维护停水期）`;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.applicationPostponeHistory.create({
        data: {
          applicationId: app.id,
          farmerId: app.farmerId,
          originalDate: currentTargetDate.toDate(),
          targetDate: nextAvailableDate.toDate(),
          reason,
        },
      });

      await tx.waterApplication.update({
        where: { id: app.id },
        data: {
          targetDate: nextAvailableDate.toDate(),
          status: ApplicationStatus.POSTPONED,
          postponeCount: app.postponeCount + 1,
          failReason: reason,
        },
      });

      await tx.notification.create({
        data: {
          farmerId: app.farmerId,
          applicationId: app.id,
          type: NotificationType.POSTPONE,
          title: '用水申请顺延通知',
          content: `您的用水申请（申请ID: ${app.id.substring(0, 8)}）因${app.failReason || '渠道流量冲突'}未能在${currentTargetDate.format('YYYY-MM-DD')}安排，已自动顺延至${nextAvailableDate.format('YYYY-MM-DD')}。顺延次数: ${app.postponeCount + 1}/${MAX_POSTPONE_DAYS}`,
        },
      });
    });

    this.logger.log(
      `申请 ${app.id} 已顺延，原日期: ${currentTargetDate.format('YYYY-MM-DD')}，新日期: ${nextAvailableDate.format('YYYY-MM-DD')}，顺延次数: ${app.postponeCount + 1}`,
    );

    return {
      applicationId: app.id,
      action: 'postponed',
      newTargetDate: nextAvailableDate.format('YYYY-MM-DD'),
      reason,
    };
  }

  private async findNextAvailableDate(
    channelId: string,
    startFrom: dayjs.Dayjs,
  ): Promise<dayjs.Dayjs | null> {
    const maxSearchDays = 30;
    let currentDate = startFrom.startOf('day');

    const ancestorChannelIds = await this.getAncestorChannelIds(channelId);
    const allChannelIds = [channelId, ...ancestorChannelIds];

    const stopWaterPeriods = await this.prisma.maintenanceOrder.findMany({
      where: {
        channelId: { in: allChannelIds },
        status: {
          in: [
            MaintenanceOrderStatus.PENDING_APPROVAL,
            MaintenanceOrderStatus.APPROVED,
            MaintenanceOrderStatus.IN_CONSTRUCTION,
          ],
        },
        stopWaterEnd: { gte: currentDate.toDate() },
      },
      select: {
        stopWaterStart: true,
        stopWaterEnd: true,
        channelId: true,
      },
    });

    for (let i = 0; i < maxSearchDays; i++) {
      const dayStart = currentDate.toDate();
      const dayEnd = currentDate.add(1, 'day').toDate();

      const hasStopWater = stopWaterPeriods.some((period) => {
        return (
          period.stopWaterStart < dayEnd && period.stopWaterEnd > dayStart
        );
      });

      if (!hasStopWater) {
        return currentDate;
      }

      currentDate = currentDate.add(1, 'day');
    }

    return null;
  }

  private async getAncestorChannelIds(channelId: string): Promise<string[]> {
    const ancestors: string[] = [];
    let currentId: string | null = channelId;

    while (currentId) {
      const ch = await this.prisma.channel.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });
      if (!ch || !ch.parentId) break;
      ancestors.push(ch.parentId);
      currentId = ch.parentId;
    }

    return ancestors;
  }

  private async markAsFinalFailed(app: any) {
    await this.prisma.$transaction(async (tx) => {
      await tx.waterApplication.update({
        where: { id: app.id },
        data: {
          status: ApplicationStatus.FAILED_FINAL,
          failReason: `已连续顺延${MAX_POSTPONE_DAYS}天仍无法安排，最终失败，请重新提交申请`,
        },
      });

      await tx.notification.create({
        data: {
          farmerId: app.farmerId,
          applicationId: app.id,
          type: NotificationType.FINAL_FAILURE,
          title: '用水申请最终失败通知',
          content: `您的用水申请（申请ID: ${app.id.substring(0, 8)}）已连续顺延${MAX_POSTPONE_DAYS}天仍无法安排，已标记为最终失败。请登录系统重新提交申请或联系管理员调整配水计划。原申请日期: ${dayjs(app.originalTargetDate).format('YYYY-MM-DD')}，申请水量: ${app.requestVolume.toFixed(2)}m³`,
        },
      });
    });

    this.logger.warn(`申请 ${app.id} 已连续顺延${MAX_POSTPONE_DAYS}天失败，标记为最终失败`);
  }

  async getFarmerPostponeHistory(farmerId: string) {
    const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId } });
    if (!farmer) {
      throw new Error('用水户不存在');
    }

    const histories = await this.prisma.applicationPostponeHistory.findMany({
      where: { farmerId },
      include: {
        application: {
          select: {
            id: true,
            expectedFlow: true,
            expectedHours: true,
            requestVolume: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return histories.map((h) => ({
      id: h.id,
      applicationId: h.applicationId,
      originalDate: dayjs(h.originalDate).format('YYYY-MM-DD'),
      targetDate: dayjs(h.targetDate).format('YYYY-MM-DD'),
      reason: h.reason,
      createdAt: h.createdAt,
      application: {
        id: h.application.id,
        expectedFlow: h.application.expectedFlow,
        expectedHours: h.application.expectedHours,
        requestVolume: h.application.requestVolume,
        status: h.application.status,
      },
    }));
  }

  async getFarmerNotifications(farmerId: string, unreadOnly: boolean = false) {
    const where: any = { farmerId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return notifications;
  }

  async markNotificationAsRead(notificationId: string, farmerId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.farmerId !== farmerId) {
      throw new Error('通知不存在或无权访问');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: 'check-emergency-approval-timeout',
    timeZone: 'Asia/Shanghai',
  })
  async checkEmergencyApprovalTimeout() {
    this.logger.log('开始检查紧急申请审批超时情况');
    const threeDaysAgo = dayjs().subtract(3, 'day').startOf('day');

    const timeoutApps = await this.prisma.waterApplication.findMany({
      where: {
        isEmergency: true,
        emergencyApprovalStatus: EmergencyApprovalStatus.PENDING_APPROVAL,
        createdAt: {
          lt: threeDaysAgo.toDate(),
        },
      },
      include: { farmer: true },
    });

    for (const app of timeoutApps) {
      await this.prisma.waterApplication.update({
        where: { id: app.id },
        data: {
          emergencyApprovalStatus: EmergencyApprovalStatus.TO_BE_TRACED,
          emergencyTracedAt: new Date(),
        },
      });
      this.logger.log(
        `紧急申请 ${app.id} 超过3天未审批，已标记为待追溯，用水户: ${app.farmer.code}`,
      );
    }

    this.logger.log(`检查完成，共处理 ${timeoutApps.length} 个超时未审批的紧急申请`);
  }

  async triggerManualScheduling(dateStr?: string) {
    const targetDate = dateStr || dayjs().format('YYYY-MM-DD');
    this.logger.log(`手动触发自动编排: ${targetDate}`);

    await this.processFailedApplications();
    const result = await this.schedulingService.runScheduling(targetDate);
    await this.handlePostponementForFailedApps(targetDate);

    return result;
  }
}
