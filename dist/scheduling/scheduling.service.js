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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const channel_service_1 = require("../channel/channel.service");
const credit_rating_service_1 = require("../credit-rating/credit-rating.service");
const dayjs_1 = __importDefault(require("dayjs"));
const enums_1 = require("../common/enums");
const SLOT_MINUTES = 30;
const MAX_DELAY_HOURS = 4;
const MAX_DELAY_SLOTS = (MAX_DELAY_HOURS * 60) / SLOT_MINUTES;
let SchedulingService = class SchedulingService {
    constructor(prisma, channelService, creditRatingService) {
        this.prisma = prisma;
        this.channelService = channelService;
        this.creditRatingService = creditRatingService;
    }
    roundToNextSlot(date) {
        const minutes = date.minute();
        const remainder = minutes % SLOT_MINUTES;
        if (remainder === 0)
            return date;
        return date.add(SLOT_MINUTES - remainder, 'minute');
    }
    timeToSlotIndex(base, time) {
        return Math.floor(time.diff(base, 'minute') / SLOT_MINUTES);
    }
    slotIndexToTime(base, index) {
        return base.add(index * SLOT_MINUTES, 'minute');
    }
    buildSlotMap(allocations, baseTime, dayEnd) {
        const slotMap = new Map();
        const totalSlots = this.timeToSlotIndex(baseTime, dayEnd);
        for (const alloc of allocations) {
            const startIdx = Math.max(0, this.timeToSlotIndex(baseTime, (0, dayjs_1.default)(alloc.startTime)));
            const endIdx = Math.min(totalSlots, this.timeToSlotIndex(baseTime, (0, dayjs_1.default)(alloc.endTime)));
            if (!slotMap.has(alloc.channelId)) {
                slotMap.set(alloc.channelId, {});
            }
            const chSlots = slotMap.get(alloc.channelId);
            for (let i = startIdx; i < endIdx; i++) {
                chSlots[i] = (chSlots[i] || 0) + alloc.flow;
            }
        }
        return slotMap;
    }
    checkCapacity(slotMap, channelId, channelMaxFlow, startSlot, endSlot, addFlow) {
        const slots = slotMap.get(channelId) || {};
        for (let i = startSlot; i < endSlot; i++) {
            const used = slots[i] || 0;
            if (used + addFlow > channelMaxFlow) {
                return i;
            }
        }
        return null;
    }
    addFlowToSlots(slotMap, channelId, startSlot, endSlot, addFlow) {
        if (!slotMap.has(channelId)) {
            slotMap.set(channelId, {});
        }
        const slots = slotMap.get(channelId);
        for (let i = startSlot; i < endSlot; i++) {
            slots[i] = (slots[i] || 0) + addFlow;
        }
    }
    async runScheduling(targetDateStr) {
        const targetDate = (0, dayjs_1.default)(targetDateStr).startOf('day');
        if (!targetDate.isValid())
            throw new common_1.BadRequestException('日期格式错误');
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
                status: { in: [enums_1.ApplicationStatus.PENDING, enums_1.ApplicationStatus.FAILED, enums_1.ApplicationStatus.POSTPONED] },
            },
            include: { farmer: { include: { channel: true } } },
            orderBy: { submitTime: 'asc' },
        });
        const farmerIds = [...new Set(pendingApps.map((a) => a.farmerId))];
        const creditLevelMap = await this.creditRatingService.getFarmerCreditLevelMap(farmerIds);
        pendingApps.sort((a, b) => {
            const levelA = creditLevelMap.get(a.farmerId) || enums_1.CreditLevel.C;
            const levelB = creditLevelMap.get(b.farmerId) || enums_1.CreditLevel.C;
            const orderA = enums_1.CreditLevelSortOrder[levelA];
            const orderB = enums_1.CreditLevelSortOrder[levelB];
            if (orderA !== orderB)
                return orderA - orderB;
            return new Date(a.submitTime).getTime() - new Date(b.submitTime).getTime();
        });
        const results = [];
        for (const app of pendingApps) {
            const appCreditLevel = creditLevelMap.get(app.farmerId) || enums_1.CreditLevel.C;
            if (appCreditLevel === enums_1.CreditLevel.D) {
                const dCheck = await this.creditRatingService.checkDFarmerCanApply(app.farmerId);
                if (!dCheck.canApply) {
                    await this.prisma.waterApplication.update({
                        where: { id: app.id },
                        data: {
                            status: enums_1.ApplicationStatus.FAILED_FINAL,
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
            const path = await this.channelService.getPathToRoot(app.farmer.channelId);
            const durationSlots = Math.ceil((app.expectedHours * 60) / SLOT_MINUTES);
            let scheduled = false;
            let failReason = null;
            let conflictChannelId = null;
            let conflictStart = null;
            let conflictEnd = null;
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
                let failedChannel = null;
                let failedSlot = null;
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
                    const conflict = this.checkCapacity(slotMap, ch.id, ch.maxFlow, chStartSlot, chEndSlot, app.expectedFlow);
                    if (conflict !== null) {
                        failedChannel = ch;
                        failedSlot = conflict;
                        allOk = false;
                        break;
                    }
                }
                if (allOk) {
                    const allocations = [];
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
                        await tx.waterApplication.update({
                            where: { id: app.id },
                            data: { status: enums_1.ApplicationStatus.SCHEDULED, failReason: null, conflictChannelId: null, conflictStartTime: null, conflictEndTime: null },
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
                }
                else if (failedChannel && failedSlot !== null) {
                    conflictChannelId = failedChannel.id;
                    conflictStart = this.slotIndexToTime(dayStart, failedSlot).toDate();
                    conflictEnd = this.slotIndexToTime(dayStart, failedSlot + 1).toDate();
                }
            }
            if (!scheduled) {
                if (!failReason) {
                    failReason = '本日无法安排,推迟4小时内均无法找到可行时段';
                }
                await this.prisma.waterApplication.update({
                    where: { id: app.id },
                    data: {
                        status: enums_1.ApplicationStatus.FAILED,
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
                    conflictTime: conflictStart ? (0, dayjs_1.default)(conflictStart).format('YYYY-MM-DD HH:mm') + ' ~ ' + (0, dayjs_1.default)(conflictEnd).format('HH:mm') : null,
                    requestedFlow: app.expectedFlow,
                });
            }
        }
        return {
            targetDate: targetDateStr,
            totalProcessed: pendingApps.length,
            scheduled: results.filter((r) => r.status === 'SCHEDULED').length,
            failed: results.filter((r) => r.status === 'FAILED').length,
            details: results,
        };
    }
    async getChannelSchedule(channelId, dateStr) {
        const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
        if (!channel)
            throw new common_1.BadRequestException('渠道不存在');
        const date = (0, dayjs_1.default)(dateStr).startOf('day');
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
        const slots = [];
        for (let i = 0; i < totalSlots; i++) {
            const slotStart = dayStart.add(i * SLOT_MINUTES, 'minute');
            const slotEnd = slotStart.add(SLOT_MINUTES, 'minute');
            let allocated = 0;
            const serving = [];
            for (const alloc of allocs) {
                const aStart = (0, dayjs_1.default)(alloc.startTime);
                const aEnd = (0, dayjs_1.default)(alloc.endTime);
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
    async getDaySchedule(dateStr) {
        const date = (0, dayjs_1.default)(dateStr).startOf('day');
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
        const byChannel = new Map();
        for (const alloc of allocs) {
            const key = alloc.channelId;
            if (!byChannel.has(key))
                byChannel.set(key, []);
            byChannel.get(key).push({
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
};
exports.SchedulingService = SchedulingService;
exports.SchedulingService = SchedulingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        channel_service_1.ChannelService,
        credit_rating_service_1.CreditRatingService])
], SchedulingService);
//# sourceMappingURL=scheduling.service.js.map