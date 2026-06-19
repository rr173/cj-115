"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AutoSchedulingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoSchedulingService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const scheduling_service_1 = require("./scheduling.service");
const dayjs_1 = __importDefault(require("dayjs"));
const enums_1 = require("../common/enums");
const MAX_POSTPONE_DAYS = 3;
let AutoSchedulingService = AutoSchedulingService_1 = class AutoSchedulingService {
    constructor(prisma, schedulingService) {
        this.prisma = prisma;
        this.schedulingService = schedulingService;
        this.logger = new common_1.Logger(AutoSchedulingService_1.name);
    }
    async handleDailyScheduling() {
        this.logger.log('开始执行每日自动配水编排任务');
        const today = (0, dayjs_1.default)().format('YYYY-MM-DD');
        try {
            await this.processFailedApplications();
            const result = await this.schedulingService.runScheduling(today);
            this.logger.log(`自动编排完成: 日期=${today}, 处理=${result.totalProcessed}, 成功=${result.scheduled}, 失败=${result.failed}`);
            await this.handlePostponementForFailedApps(today);
            this.logger.log('每日自动配水编排任务执行完成');
            return result;
        }
        catch (error) {
            this.logger.error(`自动编排任务执行失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async processFailedApplications() {
        this.logger.log('处理前一天顺延的申请');
        const yesterday = (0, dayjs_1.default)().subtract(1, 'day').startOf('day');
        const today = (0, dayjs_1.default)().startOf('day');
        const postponedApps = await this.prisma.waterApplication.findMany({
            where: {
                status: enums_1.ApplicationStatus.POSTPONED,
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
                data: { status: enums_1.ApplicationStatus.PENDING },
            });
        }
        this.logger.log(`已将 ${postponedApps.length} 个顺延申请重置为待编排状态`);
    }
    async handlePostponementForFailedApps(dateStr) {
        this.logger.log('处理编排失败的申请，执行自动顺延');
        const targetDate = (0, dayjs_1.default)(dateStr).startOf('day');
        const dayStart = targetDate.hour(0).minute(0);
        const dayEnd = dayStart.add(1, 'day');
        const failedApps = await this.prisma.waterApplication.findMany({
            where: {
                targetDate: { gte: dayStart.toDate(), lt: dayEnd.toDate() },
                status: enums_1.ApplicationStatus.FAILED,
            },
            include: { farmer: { include: { channel: true } } },
        });
        this.logger.log(`发现 ${failedApps.length} 个编排失败的申请需要处理`);
        const results = [];
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
    async tryPostponeApplication(app, currentTargetDate) {
        if (app.postponeCount >= MAX_POSTPONE_DAYS) {
            await this.markAsFinalFailed(app);
            return {
                applicationId: app.id,
                action: 'final_failed',
                reason: `已连续顺延${MAX_POSTPONE_DAYS}天仍无法安排，最终失败`,
            };
        }
        const nextAvailableDate = await this.findNextAvailableDate(app.farmer.channelId, currentTargetDate.add(1, 'day'));
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
                    status: enums_1.ApplicationStatus.POSTPONED,
                    postponeCount: app.postponeCount + 1,
                    failReason: reason,
                },
            });
            await tx.notification.create({
                data: {
                    farmerId: app.farmerId,
                    applicationId: app.id,
                    type: enums_1.NotificationType.POSTPONE,
                    title: '用水申请顺延通知',
                    content: `您的用水申请（申请ID: ${app.id.substring(0, 8)}）因${app.failReason || '渠道流量冲突'}未能在${currentTargetDate.format('YYYY-MM-DD')}安排，已自动顺延至${nextAvailableDate.format('YYYY-MM-DD')}。顺延次数: ${app.postponeCount + 1}/${MAX_POSTPONE_DAYS}`,
                },
            });
        });
        this.logger.log(`申请 ${app.id} 已顺延，原日期: ${currentTargetDate.format('YYYY-MM-DD')}，新日期: ${nextAvailableDate.format('YYYY-MM-DD')}，顺延次数: ${app.postponeCount + 1}`);
        return {
            applicationId: app.id,
            action: 'postponed',
            newTargetDate: nextAvailableDate.format('YYYY-MM-DD'),
            reason,
        };
    }
    async findNextAvailableDate(channelId, startFrom) {
        const maxSearchDays = 30;
        let currentDate = startFrom.startOf('day');
        const ancestorChannelIds = await this.getAncestorChannelIds(channelId);
        const allChannelIds = [channelId, ...ancestorChannelIds];
        const stopWaterPeriods = await this.prisma.maintenanceOrder.findMany({
            where: {
                channelId: { in: allChannelIds },
                status: {
                    in: [
                        enums_1.MaintenanceOrderStatus.PENDING_APPROVAL,
                        enums_1.MaintenanceOrderStatus.APPROVED,
                        enums_1.MaintenanceOrderStatus.IN_CONSTRUCTION,
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
                return (period.stopWaterStart < dayEnd && period.stopWaterEnd > dayStart);
            });
            if (!hasStopWater) {
                return currentDate;
            }
            currentDate = currentDate.add(1, 'day');
        }
        return null;
    }
    async getAncestorChannelIds(channelId) {
        const ancestors = [];
        let currentId = channelId;
        while (currentId) {
            const ch = await this.prisma.channel.findUnique({
                where: { id: currentId },
                select: { parentId: true },
            });
            if (!ch || !ch.parentId)
                break;
            ancestors.push(ch.parentId);
            currentId = ch.parentId;
        }
        return ancestors;
    }
    async markAsFinalFailed(app) {
        await this.prisma.$transaction(async (tx) => {
            await tx.waterApplication.update({
                where: { id: app.id },
                data: {
                    status: enums_1.ApplicationStatus.FAILED_FINAL,
                    failReason: `已连续顺延${MAX_POSTPONE_DAYS}天仍无法安排，最终失败，请重新提交申请`,
                },
            });
            await tx.notification.create({
                data: {
                    farmerId: app.farmerId,
                    applicationId: app.id,
                    type: enums_1.NotificationType.FINAL_FAILURE,
                    title: '用水申请最终失败通知',
                    content: `您的用水申请（申请ID: ${app.id.substring(0, 8)}）已连续顺延${MAX_POSTPONE_DAYS}天仍无法安排，已标记为最终失败。请登录系统重新提交申请或联系管理员调整配水计划。原申请日期: ${(0, dayjs_1.default)(app.originalTargetDate).format('YYYY-MM-DD')}，申请水量: ${app.requestVolume.toFixed(2)}m³`,
                },
            });
        });
        this.logger.warn(`申请 ${app.id} 已连续顺延${MAX_POSTPONE_DAYS}天失败，标记为最终失败`);
    }
    async getFarmerPostponeHistory(farmerId) {
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
            originalDate: (0, dayjs_1.default)(h.originalDate).format('YYYY-MM-DD'),
            targetDate: (0, dayjs_1.default)(h.targetDate).format('YYYY-MM-DD'),
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
    async getFarmerNotifications(farmerId, unreadOnly = false) {
        const where = { farmerId };
        if (unreadOnly) {
            where.isRead = false;
        }
        const notifications = await this.prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return notifications;
    }
    async markNotificationAsRead(notificationId, farmerId) {
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
    async triggerManualScheduling(dateStr) {
        const targetDate = dateStr || (0, dayjs_1.default)().format('YYYY-MM-DD');
        this.logger.log(`手动触发自动编排: ${targetDate}`);
        await this.processFailedApplications();
        const result = await this.schedulingService.runScheduling(targetDate);
        await this.handlePostponementForFailedApps(targetDate);
        return result;
    }
};
exports.AutoSchedulingService = AutoSchedulingService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT, {
        name: 'daily-auto-scheduling',
        timeZone: 'Asia/Shanghai',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AutoSchedulingService.prototype, "handleDailyScheduling", null);
exports.AutoSchedulingService = AutoSchedulingService = AutoSchedulingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        scheduling_service_1.SchedulingService])
], AutoSchedulingService);
//# sourceMappingURL=auto-scheduling.service.js.map