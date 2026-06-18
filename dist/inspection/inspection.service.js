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
exports.InspectionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const enums_1 = require("../common/enums");
const dayjs_1 = __importDefault(require("dayjs"));
let InspectionService = class InspectionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllDescendants(channelId) {
        const result = [channelId];
        const queue = [channelId];
        while (queue.length > 0) {
            const currentId = queue.shift();
            const children = await this.prisma.channel.findMany({
                where: { parentId: currentId },
                select: { id: true },
            });
            for (const child of children) {
                result.push(child.id);
                queue.push(child.id);
            }
        }
        return result;
    }
    async getAncestorIds(channelId) {
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
    async isOnSamePath(channelIdA, channelIdB) {
        if (channelIdA === channelIdB)
            return true;
        const descendantsOfA = await this.getAllDescendants(channelIdA);
        if (descendantsOfA.includes(channelIdB))
            return true;
        const descendantsOfB = await this.getAllDescendants(channelIdB);
        if (descendantsOfB.includes(channelIdA))
            return true;
        return false;
    }
    periodsOverlap(start1, end1, start2, end2) {
        return start1 < end2 && start2 < end1;
    }
    async checkStopWaterConflict(channelId, stopWaterStart, stopWaterEnd, excludeOrderId) {
        const conflictingOrders = await this.prisma.maintenanceOrder.findMany({
            where: {
                status: {
                    in: [
                        enums_1.MaintenanceOrderStatus.PENDING_APPROVAL,
                        enums_1.MaintenanceOrderStatus.APPROVED,
                        enums_1.MaintenanceOrderStatus.IN_CONSTRUCTION,
                    ],
                },
                ...(excludeOrderId ? { id: { not: excludeOrderId } } : {}),
            },
            include: { channel: true },
        });
        for (const order of conflictingOrders) {
            if (await this.isOnSamePath(channelId, order.channelId)) {
                if (this.periodsOverlap(stopWaterStart, stopWaterEnd, order.stopWaterStart, order.stopWaterEnd)) {
                    throw new common_1.BadRequestException(`停水时段与渠道"${order.channel.name}"的维护工单(${order.id.substring(0, 8)}...)存在冲突,同一路径上的渠道不能同时停水`);
                }
            }
        }
    }
    async createInspection(dto) {
        const channel = await this.prisma.channel.findUnique({ where: { id: dto.channelId } });
        if (!channel)
            throw new common_1.NotFoundException('渠道不存在');
        const inspectionDate = (0, dayjs_1.default)(dto.inspectionDate).startOf('day').toDate();
        const record = await this.prisma.inspectionRecord.create({
            data: {
                channelId: dto.channelId,
                inspectorName: dto.inspectorName,
                inspectionDate,
                description: dto.description,
                problemLevel: dto.problemLevel,
                leakageRate: dto.leakageRate,
                siltDepth: dto.siltDepth,
                liningDamageLength: dto.liningDamageLength,
            },
            include: { channel: { select: { id: true, code: true, name: true } } },
        });
        if (dto.problemLevel === enums_1.ProblemLevel.URGENT) {
            await this.prisma.channel.update({
                where: { id: dto.channelId },
                data: { inspectionStatus: enums_1.InspectionChannelStatus.PENDING_REPAIR },
            });
        }
        return record;
    }
    async findInspections(channelId, startDate, endDate) {
        const where = {};
        if (channelId)
            where.channelId = channelId;
        if (startDate || endDate) {
            where.inspectionDate = {};
            if (startDate)
                where.inspectionDate.gte = (0, dayjs_1.default)(startDate).startOf('day').toDate();
            if (endDate)
                where.inspectionDate.lte = (0, dayjs_1.default)(endDate).endOf('day').toDate();
        }
        return this.prisma.inspectionRecord.findMany({
            where,
            include: { channel: { select: { id: true, code: true, name: true, level: true } } },
            orderBy: { inspectionDate: 'desc' },
        });
    }
    async getChannelInspectionHistory(channelId) {
        const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
        if (!channel)
            throw new common_1.NotFoundException('渠道不存在');
        const records = await this.prisma.inspectionRecord.findMany({
            where: { channelId },
            include: { channel: { select: { id: true, code: true, name: true } } },
            orderBy: { inspectionDate: 'desc' },
        });
        return {
            channel: { id: channel.id, code: channel.code, name: channel.name, inspectionStatus: channel.inspectionStatus, inspectionCycleDays: channel.inspectionCycleDays },
            records,
        };
    }
    async getInspectionStatistics(channelId, startDate, endDate) {
        const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
        if (!channel)
            throw new common_1.NotFoundException('渠道不存在');
        const start = (0, dayjs_1.default)(startDate).startOf('day').toDate();
        const end = (0, dayjs_1.default)(endDate).endOf('day').toDate();
        const records = await this.prisma.inspectionRecord.findMany({
            where: {
                channelId,
                inspectionDate: { gte: start, lte: end },
            },
        });
        const distribution = {
            [enums_1.ProblemLevel.MINOR]: 0,
            [enums_1.ProblemLevel.SEVERE]: 0,
            [enums_1.ProblemLevel.URGENT]: 0,
        };
        for (const r of records) {
            if (distribution[r.problemLevel] !== undefined) {
                distribution[r.problemLevel]++;
            }
        }
        return {
            channelId,
            channelName: channel.name,
            period: { startDate, endDate },
            totalRecords: records.length,
            distribution,
        };
    }
    async getOverdueChannels() {
        const channels = await this.prisma.channel.findMany({
            include: {
                inspections: {
                    orderBy: { inspectionDate: 'desc' },
                    take: 1,
                },
            },
            orderBy: [{ level: 'asc' }, { code: 'asc' }],
        });
        const overdue = [];
        const now = (0, dayjs_1.default)();
        for (const ch of channels) {
            const cycle = ch.inspectionCycleDays;
            const lastInspection = ch.inspections.length > 0 ? ch.inspections[0] : null;
            if (!lastInspection) {
                overdue.push({
                    channelId: ch.id,
                    channelCode: ch.code,
                    channelName: ch.name,
                    channelLevel: ch.level,
                    inspectionCycleDays: cycle,
                    lastInspectionDate: null,
                    overdueDays: null,
                    message: '从未巡检',
                });
            }
            else {
                const lastDate = (0, dayjs_1.default)(lastInspection.inspectionDate);
                const diffDays = now.diff(lastDate, 'day');
                if (diffDays > cycle) {
                    overdue.push({
                        channelId: ch.id,
                        channelCode: ch.code,
                        channelName: ch.name,
                        channelLevel: ch.level,
                        inspectionCycleDays: cycle,
                        lastInspectionDate: lastInspection.inspectionDate,
                        overdueDays: diffDays - cycle,
                        message: `已超期${diffDays - cycle}天`,
                    });
                }
            }
        }
        return overdue;
    }
    async createMaintenanceOrder(dto) {
        const channel = await this.prisma.channel.findUnique({ where: { id: dto.channelId } });
        if (!channel)
            throw new common_1.NotFoundException('渠道不存在');
        if (channel.inspectionStatus !== enums_1.InspectionChannelStatus.PENDING_REPAIR) {
            throw new common_1.BadRequestException(`渠道当前巡检状态为"${channel.inspectionStatus}",仅"待维修"状态的渠道可创建维护工单`);
        }
        const planStart = (0, dayjs_1.default)(dto.planStartDate).startOf('day');
        const planEnd = planStart.add(dto.estimatedDurationDays, 'day');
        const stopWaterStart = planStart.toDate();
        const stopWaterEnd = planEnd.toDate();
        await this.checkStopWaterConflict(dto.channelId, stopWaterStart, stopWaterEnd);
        return this.prisma.maintenanceOrder.create({
            data: {
                channelId: dto.channelId,
                planStartDate: planStart.toDate(),
                estimatedDurationDays: dto.estimatedDurationDays,
                crewCode: dto.crewCode,
                stopWaterStart,
                stopWaterEnd,
                status: enums_1.MaintenanceOrderStatus.PENDING_APPROVAL,
            },
            include: { channel: { select: { id: true, code: true, name: true, level: true } } },
        });
    }
    async findMaintenanceOrders(status, channelId) {
        const where = {};
        if (status)
            where.status = status;
        if (channelId)
            where.channelId = channelId;
        return this.prisma.maintenanceOrder.findMany({
            where,
            include: { channel: { select: { id: true, code: true, name: true, level: true } } },
            orderBy: { planStartDate: 'asc' },
        });
    }
    async findOneMaintenanceOrder(id) {
        const order = await this.prisma.maintenanceOrder.findUnique({
            where: { id },
            include: { channel: { select: { id: true, code: true, name: true, level: true, inspectionStatus: true } } },
        });
        if (!order)
            throw new common_1.NotFoundException('维护工单不存在');
        return order;
    }
    async approveMaintenanceOrder(id) {
        const order = await this.prisma.maintenanceOrder.findUnique({
            where: { id },
            include: { channel: true },
        });
        if (!order)
            throw new common_1.NotFoundException('维护工单不存在');
        if (order.status !== enums_1.MaintenanceOrderStatus.PENDING_APPROVAL) {
            throw new common_1.BadRequestException(`工单当前状态为"${order.status}",仅"待审批"状态的工单可审批`);
        }
        await this.checkStopWaterConflict(order.channelId, order.stopWaterStart, order.stopWaterEnd, id);
        const affectedChannelIds = await this.getAllDescendants(order.channelId);
        const affectedFarmers = await this.prisma.farmer.findMany({
            where: { channelId: { in: affectedChannelIds } },
            include: { channel: { select: { id: true, code: true, name: true } } },
        });
        const affectedFarmerIds = affectedFarmers.map((f) => f.id);
        const totalAffectedArea = affectedFarmers.reduce((sum, f) => sum + f.area, 0);
        const stopStart = (0, dayjs_1.default)(order.stopWaterStart);
        const stopEnd = (0, dayjs_1.default)(order.stopWaterEnd);
        const affectedApplications = await this.prisma.waterApplication.findMany({
            where: {
                farmerId: { in: affectedFarmerIds },
                targetDate: {
                    gte: stopStart.startOf('day').toDate(),
                    lt: stopEnd.endOf('day').toDate(),
                },
                status: { in: [enums_1.ApplicationStatus.PENDING, enums_1.ApplicationStatus.SCHEDULED] },
            },
            include: {
                farmer: {
                    select: { id: true, code: true, name: true, channel: { select: { id: true, code: true, name: true } } },
                },
                allocations: { include: { channel: { select: { id: true, code: true, name: true } } } },
            },
        });
        const impactAnalysis = {
            affectedChannelCount: affectedChannelIds.length,
            affectedChannelIds,
            affectedFarmerCount: affectedFarmers.length,
            totalAffectedArea,
            affectedApplicationCount: affectedApplications.length,
            affectedApplications: affectedApplications.map((a) => ({
                id: a.id,
                farmerCode: a.farmer.code,
                farmerName: a.farmer.name,
                channelCode: a.farmer.channel.code,
                channelName: a.farmer.channel.name,
                targetDate: a.targetDate,
                requestVolume: a.requestVolume,
                status: a.status,
                action: '取消或改期',
            })),
        };
        await this.prisma.$transaction(async (tx) => {
            for (const app of affectedApplications) {
                await tx.waterAllocation.deleteMany({ where: { applicationId: app.id } });
                await tx.waterApplication.update({
                    where: { id: app.id },
                    data: {
                        status: enums_1.ApplicationStatus.CANCELLED_MAINTENANCE,
                        failReason: `因渠道"${order.channel.name}"维护停水(${stopStart.format('YYYY-MM-DD')}~${stopEnd.format('YYYY-MM-DD')})取消`,
                    },
                });
            }
            await tx.maintenanceOrder.update({
                where: { id },
                data: {
                    status: enums_1.MaintenanceOrderStatus.APPROVED,
                    approvedAt: new Date(),
                    impactAnalysis: JSON.stringify(impactAnalysis),
                },
            });
        });
        return {
            order: await this.prisma.maintenanceOrder.findUnique({
                where: { id },
                include: { channel: { select: { id: true, code: true, name: true, level: true } } },
            }),
            impactAnalysis,
        };
    }
    async startMaintenanceOrder(id) {
        const order = await this.prisma.maintenanceOrder.findUnique({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('维护工单不存在');
        if (order.status !== enums_1.MaintenanceOrderStatus.APPROVED) {
            throw new common_1.BadRequestException(`工单当前状态为"${order.status}",仅"已审批"状态的工单可开始施工`);
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.maintenanceOrder.update({
                where: { id },
                data: {
                    status: enums_1.MaintenanceOrderStatus.IN_CONSTRUCTION,
                    startedAt: new Date(),
                },
            });
            await tx.channel.update({
                where: { id: order.channelId },
                data: { inspectionStatus: enums_1.InspectionChannelStatus.REPAIRING },
            });
        });
        return this.prisma.maintenanceOrder.findUnique({
            where: { id },
            include: { channel: { select: { id: true, code: true, name: true, level: true, inspectionStatus: true } } },
        });
    }
    async acceptMaintenanceOrder(id) {
        const order = await this.prisma.maintenanceOrder.findUnique({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('维护工单不存在');
        if (order.status !== enums_1.MaintenanceOrderStatus.IN_CONSTRUCTION) {
            throw new common_1.BadRequestException(`工单当前状态为"${order.status}",仅"施工中"状态的工单可验收`);
        }
        return this.prisma.maintenanceOrder.update({
            where: { id },
            data: {
                status: enums_1.MaintenanceOrderStatus.ACCEPTED,
                acceptedAt: new Date(),
            },
            include: { channel: { select: { id: true, code: true, name: true, level: true } } },
        });
    }
    async closeMaintenanceOrder(id) {
        const order = await this.prisma.maintenanceOrder.findUnique({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('维护工单不存在');
        if (order.status !== enums_1.MaintenanceOrderStatus.ACCEPTED) {
            throw new common_1.BadRequestException(`工单当前状态为"${order.status}",仅"已验收"状态的工单可关闭`);
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.maintenanceOrder.update({
                where: { id },
                data: {
                    status: enums_1.MaintenanceOrderStatus.CLOSED,
                    closedAt: new Date(),
                },
            });
            const otherActiveOrders = await tx.maintenanceOrder.findFirst({
                where: {
                    channelId: order.channelId,
                    status: {
                        in: [
                            enums_1.MaintenanceOrderStatus.PENDING_APPROVAL,
                            enums_1.MaintenanceOrderStatus.APPROVED,
                            enums_1.MaintenanceOrderStatus.IN_CONSTRUCTION,
                            enums_1.MaintenanceOrderStatus.ACCEPTED,
                        ],
                    },
                    id: { not: id },
                },
            });
            if (!otherActiveOrders) {
                await tx.channel.update({
                    where: { id: order.channelId },
                    data: { inspectionStatus: enums_1.InspectionChannelStatus.COMPLETED },
                });
            }
        });
        return this.prisma.maintenanceOrder.findUnique({
            where: { id },
            include: { channel: { select: { id: true, code: true, name: true, level: true, inspectionStatus: true } } },
        });
    }
    async resetChannelInspectionStatus(channelId) {
        const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
        if (!channel)
            throw new common_1.NotFoundException('渠道不存在');
        if (channel.inspectionStatus !== enums_1.InspectionChannelStatus.COMPLETED) {
            throw new common_1.BadRequestException(`渠道当前状态为"${channel.inspectionStatus}",仅"已完工"状态可重置为正常`);
        }
        return this.prisma.channel.update({
            where: { id: channelId },
            data: { inspectionStatus: enums_1.InspectionChannelStatus.NORMAL },
        });
    }
    async getStopWaterSchedule(startDate, endDate) {
        const start = (0, dayjs_1.default)(startDate).startOf('day').toDate();
        const end = (0, dayjs_1.default)(endDate).endOf('day').toDate();
        const orders = await this.prisma.maintenanceOrder.findMany({
            where: {
                status: {
                    in: [
                        enums_1.MaintenanceOrderStatus.PENDING_APPROVAL,
                        enums_1.MaintenanceOrderStatus.APPROVED,
                        enums_1.MaintenanceOrderStatus.IN_CONSTRUCTION,
                    ],
                },
                stopWaterStart: { lte: end },
                stopWaterEnd: { gte: start },
            },
            include: { channel: { select: { id: true, code: true, name: true, level: true, parentId: true } } },
            orderBy: { stopWaterStart: 'asc' },
        });
        const byDate = {};
        let current = (0, dayjs_1.default)(startDate).startOf('day');
        const last = (0, dayjs_1.default)(endDate).startOf('day');
        while (current.isBefore(last) || current.isSame(last, 'day')) {
            const dateKey = current.format('YYYY-MM-DD');
            byDate[dateKey] = [];
            current = current.add(1, 'day');
        }
        for (const order of orders) {
            const oStart = (0, dayjs_1.default)(order.stopWaterStart);
            const oEnd = (0, dayjs_1.default)(order.stopWaterEnd);
            let d = oStart.isAfter((0, dayjs_1.default)(startDate).startOf('day')) ? oStart : (0, dayjs_1.default)(startDate).startOf('day');
            const boundary = oEnd.isBefore((0, dayjs_1.default)(endDate).endOf('day')) ? oEnd : (0, dayjs_1.default)(endDate).endOf('day');
            while (d.isBefore(boundary) || d.isSame(boundary, 'day')) {
                const dateKey = d.format('YYYY-MM-DD');
                if (byDate[dateKey]) {
                    byDate[dateKey].push({
                        orderId: order.id,
                        channel: order.channel,
                        stopWaterStart: order.stopWaterStart,
                        stopWaterEnd: order.stopWaterEnd,
                        status: order.status,
                        crewCode: order.crewCode,
                    });
                }
                d = d.add(1, 'day');
            }
        }
        return {
            period: { startDate, endDate },
            totalOrders: orders.length,
            byDate,
            orders: orders.map((o) => ({
                id: o.id,
                channel: o.channel,
                planStartDate: o.planStartDate,
                estimatedDurationDays: o.estimatedDurationDays,
                stopWaterStart: o.stopWaterStart,
                stopWaterEnd: o.stopWaterEnd,
                status: o.status,
                crewCode: o.crewCode,
            })),
        };
    }
};
exports.InspectionService = InspectionService;
exports.InspectionService = InspectionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InspectionService);
//# sourceMappingURL=inspection.service.js.map