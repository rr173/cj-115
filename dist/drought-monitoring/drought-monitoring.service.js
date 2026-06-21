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
exports.DroughtMonitoringService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const credit_rating_service_1 = require("../credit-rating/credit-rating.service");
const schedule_1 = require("@nestjs/schedule");
const dayjs_1 = __importDefault(require("dayjs"));
const enums_1 = require("../common/enums");
const SLOT_MINUTES = 30;
const CREDIT_REDUCTION_RATES = {
    [enums_1.CreditLevel.A]: 0,
    [enums_1.CreditLevel.B]: 0.1,
    [enums_1.CreditLevel.C]: 0.3,
    [enums_1.CreditLevel.D]: 1.0,
};
const CREDIT_RESTORE_ORDER = [enums_1.CreditLevel.A, enums_1.CreditLevel.B, enums_1.CreditLevel.C, enums_1.CreditLevel.D];
function ratioToStatus(ratio) {
    if (ratio > 1.2)
        return enums_1.DroughtStatus.ABUNDANT;
    if (ratio >= 0.8)
        return enums_1.DroughtStatus.NORMAL;
    if (ratio >= 0.5)
        return enums_1.DroughtStatus.TENSE;
    return enums_1.DroughtStatus.SEVERE;
}
let DroughtMonitoringService = class DroughtMonitoringService {
    constructor(prisma, creditRatingService) {
        this.prisma = prisma;
        this.creditRatingService = creditRatingService;
        this.currentDroughtStatus = enums_1.DroughtStatus.NORMAL;
        this.pendingRecovery = false;
        this.latestActualFlow = 0;
        this.latestDemandFlow = 0;
        this.latestRatio = 1;
    }
    async reportWaterSource(dto) {
        const channel = await this.prisma.channel.findUnique({ where: { id: dto.channelId } });
        if (!channel)
            throw new common_1.BadRequestException('渠道不存在');
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
    async evaluateDroughtStatus(actualFlow, evaluatedAt) {
        const demandFlow = await this.calcCurrentDemandFlow();
        const ratio = demandFlow > 0 ? actualFlow / demandFlow : 1;
        const newStatus = ratioToStatus(ratio);
        this.latestActualFlow = actualFlow;
        this.latestDemandFlow = demandFlow;
        this.latestRatio = ratio;
        const previousStatus = this.currentDroughtStatus;
        if (newStatus !== previousStatus) {
            let emergencyLevel = null;
            let message = '';
            if (newStatus === enums_1.DroughtStatus.TENSE) {
                emergencyLevel = enums_1.EmergencyLevel.LEVEL_1;
                message = `供需比${ratio.toFixed(2)}降至紧张区间,启动一级响应:暂停D级用水户配水计划`;
            }
            else if (newStatus === enums_1.DroughtStatus.SEVERE) {
                emergencyLevel = enums_1.EmergencyLevel.LEVEL_2;
                message = `供需比${ratio.toFixed(2)}降至严重缺水区间,启动二级响应:按信用等级削减配水流量`;
            }
            else if (newStatus === enums_1.DroughtStatus.NORMAL || newStatus === enums_1.DroughtStatus.ABUNDANT) {
                message = `供需比${ratio.toFixed(2)}恢复至${enums_1.DroughtStatusNames[newStatus]},将在下一时隙恢复被暂停/削减的配水计划`;
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
            if (newStatus === enums_1.DroughtStatus.TENSE) {
                await this.executeLevel1Response();
            }
            else if (newStatus === enums_1.DroughtStatus.SEVERE) {
                await this.executeLevel2Response();
            }
        }
        else {
            if ((newStatus === enums_1.DroughtStatus.NORMAL || newStatus === enums_1.DroughtStatus.ABUNDANT) && this.pendingRecovery) {
            }
        }
        await this.recordSnapshot(actualFlow, demandFlow, ratio, newStatus, evaluatedAt);
    }
    async calcCurrentDemandFlow() {
        const now = (0, dayjs_1.default)();
        const dayStart = now.startOf('day').toDate();
        const dayEnd = now.endOf('day').toDate();
        const allocations = await this.prisma.waterAllocation.findMany({
            where: {
                startTime: { gte: dayStart, lte: dayEnd },
                droughtStatus: enums_1.AllocationDroughtStatus.NORMAL,
            },
        });
        const reducedAllocations = await this.prisma.waterAllocation.findMany({
            where: {
                startTime: { gte: dayStart, lte: dayEnd },
                droughtStatus: enums_1.AllocationDroughtStatus.REDUCED,
            },
        });
        let total = 0;
        for (const a of allocations) {
            total += a.flow;
        }
        for (const a of reducedAllocations) {
            total += a.flow;
        }
        return total;
    }
    async recordSnapshot(actualFlow, demandFlow, ratio, status, timestamp) {
        const hour = (0, dayjs_1.default)(timestamp).startOf('hour').toDate();
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
    async executeLevel1Response() {
        const now = (0, dayjs_1.default)();
        const dayStart = now.startOf('day').toDate();
        const dayEnd = now.endOf('day').toDate();
        const scheduledApps = await this.prisma.waterApplication.findMany({
            where: {
                status: enums_1.ApplicationStatus.SCHEDULED,
                targetDate: { gte: dayStart, lte: dayEnd },
            },
            include: { allocations: true },
        });
        const farmerIds = [...new Set(scheduledApps.map((a) => a.farmerId))];
        const creditMap = await this.creditRatingService.getFarmerCreditLevelMap(farmerIds);
        for (const app of scheduledApps) {
            const creditLevel = creditMap.get(app.farmerId) || enums_1.CreditLevel.C;
            if (creditLevel === enums_1.CreditLevel.D) {
                for (const alloc of app.allocations) {
                    if (alloc.droughtStatus === enums_1.AllocationDroughtStatus.NORMAL) {
                        await this.prisma.waterAllocation.update({
                            where: { id: alloc.id },
                            data: { droughtStatus: enums_1.AllocationDroughtStatus.SUSPENDED },
                        });
                    }
                }
            }
        }
    }
    async executeLevel2Response() {
        const now = (0, dayjs_1.default)();
        const dayStart = now.startOf('day').toDate();
        const dayEnd = now.endOf('day').toDate();
        const allScheduledApps = await this.prisma.waterApplication.findMany({
            where: {
                status: enums_1.ApplicationStatus.SCHEDULED,
                targetDate: { gte: dayStart, lte: dayEnd },
            },
            include: { allocations: true },
        });
        const farmerIds = [...new Set(allScheduledApps.map((a) => a.farmerId))];
        const creditMap = await this.creditRatingService.getFarmerCreditLevelMap(farmerIds);
        for (const app of allScheduledApps) {
            const creditLevel = creditMap.get(app.farmerId) || enums_1.CreditLevel.C;
            const reductionRate = CREDIT_REDUCTION_RATES[creditLevel] ?? 0;
            for (const alloc of app.allocations) {
                if (alloc.droughtStatus === enums_1.AllocationDroughtStatus.SUSPENDED)
                    continue;
                if (reductionRate >= 1.0) {
                    if (alloc.droughtStatus === enums_1.AllocationDroughtStatus.NORMAL) {
                        await this.prisma.waterAllocation.update({
                            where: { id: alloc.id },
                            data: { droughtStatus: enums_1.AllocationDroughtStatus.SUSPENDED },
                        });
                    }
                }
                else if (reductionRate > 0) {
                    if (alloc.droughtStatus === enums_1.AllocationDroughtStatus.NORMAL) {
                        const reducedFlow = +(alloc.flow * (1 - reductionRate)).toFixed(4);
                        await this.prisma.waterAllocation.update({
                            where: { id: alloc.id },
                            data: {
                                droughtStatus: enums_1.AllocationDroughtStatus.REDUCED,
                                originalFlow: alloc.flow,
                                flow: reducedFlow,
                            },
                        });
                    }
                }
            }
        }
    }
    async processPendingRecovery() {
        if (!this.pendingRecovery)
            return;
        if (this.currentDroughtStatus !== enums_1.DroughtStatus.NORMAL && this.currentDroughtStatus !== enums_1.DroughtStatus.ABUNDANT) {
            this.pendingRecovery = false;
            return;
        }
        await this.restoreAllAllocations();
        this.pendingRecovery = false;
    }
    async restoreAllAllocations() {
        const suspendedAllocs = await this.prisma.waterAllocation.findMany({
            where: { droughtStatus: enums_1.AllocationDroughtStatus.SUSPENDED },
            include: { application: { select: { farmerId: true } } },
        });
        const reducedAllocs = await this.prisma.waterAllocation.findMany({
            where: { droughtStatus: enums_1.AllocationDroughtStatus.REDUCED },
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
            ...suspendedAllocs.map((a) => ({ id: a.id, type: 'suspended', originalFlow: null, farmerId: a.application.farmerId })),
            ...reducedAllocs.map((a) => ({ id: a.id, type: 'reduced', originalFlow: a.originalFlow, farmerId: a.application.farmerId })),
        ];
        allAllocs.sort((a, b) => {
            const levelA = creditMap.get(a.farmerId) || enums_1.CreditLevel.C;
            const levelB = creditMap.get(b.farmerId) || enums_1.CreditLevel.C;
            const orderA = CREDIT_RESTORE_ORDER.indexOf(levelA);
            const orderB = CREDIT_RESTORE_ORDER.indexOf(levelB);
            if (orderA !== orderB)
                return orderA - orderB;
            return a.id.localeCompare(b.id);
        });
        for (const alloc of allAllocs) {
            if (alloc.type === 'suspended') {
                await this.prisma.waterAllocation.update({
                    where: { id: alloc.id },
                    data: {
                        droughtStatus: enums_1.AllocationDroughtStatus.NORMAL,
                    },
                });
            }
            else {
                const original = await this.prisma.waterAllocation.findUnique({ where: { id: alloc.id } });
                if (original && original.originalFlow !== null) {
                    await this.prisma.waterAllocation.update({
                        where: { id: alloc.id },
                        data: {
                            droughtStatus: enums_1.AllocationDroughtStatus.NORMAL,
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
            droughtStatusName: enums_1.DroughtStatusNames[this.currentDroughtStatus],
            actualFlow: this.latestActualFlow,
            demandFlow: this.latestDemandFlow,
            emergencyLevel: this.currentDroughtStatus === enums_1.DroughtStatus.SEVERE
                ? enums_1.EmergencyLevel.LEVEL_2
                : this.currentDroughtStatus === enums_1.DroughtStatus.TENSE
                    ? enums_1.EmergencyLevel.LEVEL_1
                    : null,
            emergencyLevelName: this.currentDroughtStatus === enums_1.DroughtStatus.SEVERE
                ? enums_1.EmergencyLevelNames[enums_1.EmergencyLevel.LEVEL_2]
                : this.currentDroughtStatus === enums_1.DroughtStatus.TENSE
                    ? enums_1.EmergencyLevelNames[enums_1.EmergencyLevel.LEVEL_1]
                    : null,
            pendingRecovery: this.pendingRecovery,
        };
    }
    async getDroughtEvents(dto) {
        const where = {};
        if (dto.level)
            where.level = dto.level;
        if (dto.startTime || dto.endTime) {
            where.createdAt = {};
            if (dto.startTime)
                where.createdAt.gte = new Date(dto.startTime);
            if (dto.endTime)
                where.createdAt.lte = new Date(dto.endTime);
        }
        const events = await this.prisma.droughtAlertEvent.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 200,
        });
        return events.map((e) => ({
            id: e.id,
            level: e.level,
            levelName: enums_1.DroughtStatusNames[e.level] || e.level,
            previousLevel: e.previousLevel,
            previousLevelName: e.previousLevel ? enums_1.DroughtStatusNames[e.previousLevel] || e.previousLevel : null,
            supplyDemandRatio: e.supplyDemandRatio,
            actualFlow: e.actualFlow,
            demandFlow: e.demandFlow,
            emergencyLevel: e.emergencyLevel,
            emergencyLevelName: e.emergencyLevel ? enums_1.EmergencyLevelNames[e.emergencyLevel] || e.emergencyLevel : null,
            message: e.message,
            createdAt: e.createdAt,
        }));
    }
    async getAffectedAllocations() {
        const suspended = await this.prisma.waterAllocation.findMany({
            where: { droughtStatus: enums_1.AllocationDroughtStatus.SUSPENDED },
            include: {
                application: {
                    include: { farmer: { select: { id: true, code: true, name: true } } },
                },
                channel: { select: { id: true, code: true, name: true } },
            },
            orderBy: { startTime: 'asc' },
        });
        const reduced = await this.prisma.waterAllocation.findMany({
            where: { droughtStatus: enums_1.AllocationDroughtStatus.REDUCED },
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
                droughtStatusName: enums_1.AllocationDroughtStatusNames[a.droughtStatus],
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
                droughtStatusName: enums_1.AllocationDroughtStatusNames[a.droughtStatus],
            })),
        };
    }
    async manualTriggerEmergency() {
        const now = new Date();
        const demandFlow = await this.calcCurrentDemandFlow();
        const actualFlow = this.latestActualFlow || 0;
        const ratio = demandFlow > 0 ? actualFlow / demandFlow : 1;
        const status = ratioToStatus(ratio);
        if (status !== enums_1.DroughtStatus.TENSE && status !== enums_1.DroughtStatus.SEVERE) {
            throw new common_1.BadRequestException(`当前供需比${ratio.toFixed(2)}为${enums_1.DroughtStatusNames[status]},无需触发应急响应`);
        }
        const previousStatus = this.currentDroughtStatus;
        let emergencyLevel;
        let message;
        if (status === enums_1.DroughtStatus.SEVERE) {
            emergencyLevel = enums_1.EmergencyLevel.LEVEL_2;
            message = `手动触发二级响应:供需比${ratio.toFixed(2)},按信用等级削减配水流量`;
            this.currentDroughtStatus = enums_1.DroughtStatus.SEVERE;
            await this.executeLevel2Response();
        }
        else {
            emergencyLevel = enums_1.EmergencyLevel.LEVEL_1;
            message = `手动触发一级响应:供需比${ratio.toFixed(2)},暂停D级用水户配水计划`;
            this.currentDroughtStatus = enums_1.DroughtStatus.TENSE;
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
            emergencyLevelName: enums_1.EmergencyLevelNames[emergencyLevel],
            supplyDemandRatio: ratio,
            droughtStatus: this.currentDroughtStatus,
            droughtStatusName: enums_1.DroughtStatusNames[this.currentDroughtStatus],
        };
    }
    async manualLiftEmergency() {
        const previousStatus = this.currentDroughtStatus;
        if (previousStatus === enums_1.DroughtStatus.NORMAL || previousStatus === enums_1.DroughtStatus.ABUNDANT) {
            throw new common_1.BadRequestException('当前未处于应急状态,无需解除');
        }
        await this.restoreAllAllocations();
        this.currentDroughtStatus = enums_1.DroughtStatus.NORMAL;
        this.pendingRecovery = false;
        await this.prisma.droughtAlertEvent.create({
            data: {
                level: enums_1.DroughtStatus.NORMAL,
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
            previousStatusName: enums_1.DroughtStatusNames[previousStatus],
            currentStatus: enums_1.DroughtStatus.NORMAL,
            currentStatusName: enums_1.DroughtStatusNames[enums_1.DroughtStatus.NORMAL],
        };
    }
    async createChannelTransfer(dto) {
        if (dto.sourceChannelId === dto.targetChannelId) {
            throw new common_1.BadRequestException('借出渠道和借入渠道不能相同');
        }
        if (this.currentDroughtStatus !== enums_1.DroughtStatus.TENSE && this.currentDroughtStatus !== enums_1.DroughtStatus.SEVERE) {
            throw new common_1.BadRequestException('当前旱情状态不允许渠道借调,仅在紧张或严重缺水时可借调');
        }
        const sourceChannel = await this.prisma.channel.findUnique({ where: { id: dto.sourceChannelId } });
        if (!sourceChannel)
            throw new common_1.BadRequestException('借出渠道不存在');
        const targetChannel = await this.prisma.channel.findUnique({ where: { id: dto.targetChannelId } });
        if (!targetChannel)
            throw new common_1.BadRequestException('借入渠道不存在');
        const existingSourceTransfer = await this.prisma.channelTransfer.findFirst({
            where: {
                sourceChannelId: dto.sourceChannelId,
                status: enums_1.ChannelTransferStatus.ACTIVE,
            },
        });
        if (existingSourceTransfer) {
            throw new common_1.BadRequestException('该渠道已有活跃的借调关系,同一条渠道不能同时借给两个对象');
        }
        const now = (0, dayjs_1.default)();
        const dayStart = now.startOf('day').toDate();
        const dayEnd = now.endOf('day').toDate();
        const activeAllocs = await this.prisma.waterAllocation.findFirst({
            where: {
                channelId: dto.sourceChannelId,
                startTime: { gte: dayStart, lte: dayEnd },
                droughtStatus: { not: enums_1.AllocationDroughtStatus.SUSPENDED },
            },
        });
        if (activeAllocs) {
            throw new common_1.BadRequestException('借出渠道不是空闲渠道,存在正在执行的配水计划');
        }
        if (dto.transferredCapacity > sourceChannel.maxFlow) {
            throw new common_1.BadRequestException(`借调容量${dto.transferredCapacity}超过借出渠道设计容量${sourceChannel.maxFlow}`);
        }
        const transfer = await this.prisma.channelTransfer.create({
            data: {
                sourceChannelId: dto.sourceChannelId,
                targetChannelId: dto.targetChannelId,
                transferredCapacity: dto.transferredCapacity,
                status: enums_1.ChannelTransferStatus.ACTIVE,
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
            statusName: enums_1.ChannelTransferStatusNames[transfer.status],
            createdAt: transfer.createdAt,
        };
    }
    async getChannelTransfers(dto) {
        const where = {};
        if (dto.status)
            where.status = dto.status;
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
            statusName: enums_1.ChannelTransferStatusNames[t.status],
            createdAt: t.createdAt,
            releasedAt: t.releasedAt,
        }));
    }
    async releaseAllChannelTransfers() {
        const activeTransfers = await this.prisma.channelTransfer.findMany({
            where: { status: enums_1.ChannelTransferStatus.ACTIVE },
        });
        for (const t of activeTransfers) {
            await this.prisma.channelTransfer.update({
                where: { id: t.id },
                data: {
                    status: enums_1.ChannelTransferStatus.RELEASED,
                    releasedAt: new Date(),
                },
            });
        }
    }
    async getSupplyDemandTrend(dto) {
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
                droughtStatusName: enums_1.DroughtStatusNames[s.droughtStatus] || s.droughtStatus,
            })),
        };
    }
    async getChannelEffectiveCapacity(channelId) {
        const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
        if (!channel)
            throw new common_1.NotFoundException('渠道不存在');
        let effectiveCapacity = channel.maxFlow;
        const incomingTransfers = await this.prisma.channelTransfer.findMany({
            where: {
                targetChannelId: channelId,
                status: enums_1.ChannelTransferStatus.ACTIVE,
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
};
exports.DroughtMonitoringService = DroughtMonitoringService;
__decorate([
    (0, schedule_1.Cron)('0 */30 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DroughtMonitoringService.prototype, "processPendingRecovery", null);
exports.DroughtMonitoringService = DroughtMonitoringService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        credit_rating_service_1.CreditRatingService])
], DroughtMonitoringService);
//# sourceMappingURL=drought-monitoring.service.js.map