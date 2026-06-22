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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmergencyApplicationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const credit_rating_service_1 = require("../credit-rating/credit-rating.service");
const dayjs_1 = __importDefault(require("dayjs"));
const enums_1 = require("../common/enums");
let EmergencyApplicationService = class EmergencyApplicationService {
    constructor(prisma, creditRatingService) {
        this.prisma = prisma;
        this.creditRatingService = creditRatingService;
    }
    async approve(id, dto) {
        const app = await this.prisma.waterApplication.findUnique({
            where: { id },
            include: { farmer: true },
        });
        if (!app) {
            throw new common_1.NotFoundException('申请不存在');
        }
        if (!app.isEmergency) {
            throw new common_1.BadRequestException('该申请不是紧急申请');
        }
        if (app.emergencyApprovalStatus === enums_1.EmergencyApprovalStatus.APPROVED ||
            app.emergencyApprovalStatus === enums_1.EmergencyApprovalStatus.REJECTED) {
            throw new common_1.BadRequestException('该紧急申请已完成审批，不可重复操作');
        }
        if (dto.result === 'REJECTED' && !dto.rejectReason) {
            throw new common_1.BadRequestException('驳回紧急申请必须填写原因');
        }
        const updateData = {
            emergencyApprovalStatus: dto.result === 'APPROVED'
                ? enums_1.EmergencyApprovalStatus.APPROVED
                : enums_1.EmergencyApprovalStatus.REJECTED,
            emergencyApprovedAt: new Date(),
            emergencyApprovedBy: dto.operator || '系统管理员',
        };
        if (dto.result === 'REJECTED') {
            updateData.emergencyRejectReason = dto.rejectReason;
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.waterApplication.update({
                where: { id },
                data: updateData,
            });
            if (dto.result === 'REJECTED') {
                await this.creditRatingService.adjustCreditScoreWithTx(tx, app.farmerId, -10, `紧急申请被驳回: ${dto.rejectReason}`, dto.operator || '系统管理员');
            }
        });
        return {
            id: app.id,
            result: dto.result,
            farmerId: app.farmerId,
            farmerCode: app.farmer.code,
            farmerName: app.farmer.name,
            emergencyReason: app.emergencyReason,
            creditDeducted: dto.result === 'REJECTED' ? 10 : 0,
            approvedAt: updateData.emergencyApprovedAt,
            approvedBy: updateData.emergencyApprovedBy,
            rejectReason: dto.rejectReason,
        };
    }
    async findAll(dto) {
        const page = dto.page || 1;
        const pageSize = dto.pageSize || 20;
        const skip = (page - 1) * pageSize;
        const where = {
            isEmergency: true,
        };
        if (dto.status) {
            where.emergencyApprovalStatus = dto.status;
        }
        if (dto.farmerId) {
            where.farmerId = dto.farmerId;
        }
        const [total, list] = await this.prisma.$transaction([
            this.prisma.waterApplication.count({ where }),
            this.prisma.waterApplication.findMany({
                where,
                skip,
                take: pageSize,
                include: {
                    farmer: { select: { id: true, code: true, name: true } },
                    allocations: { include: { channel: { select: { id: true, code: true, name: true } } } },
                },
                orderBy: [{ createdAt: 'desc' }],
            }),
        ]);
        return {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            list: list.map((app) => ({
                id: app.id,
                farmerId: app.farmerId,
                farmerCode: app.farmer.code,
                farmerName: app.farmer.name,
                expectedFlow: app.expectedFlow,
                expectedHours: app.expectedHours,
                requestVolume: app.requestVolume,
                targetDate: (0, dayjs_1.default)(app.targetDate).format('YYYY-MM-DD'),
                status: app.status,
                emergencyReason: app.emergencyReason,
                emergencyApprovalStatus: app.emergencyApprovalStatus,
                emergencyApprovedAt: app.emergencyApprovedAt,
                emergencyApprovedBy: app.emergencyApprovedBy,
                emergencyRejectReason: app.emergencyRejectReason,
                emergencyTracedAt: app.emergencyTracedAt,
                submitTime: app.submitTime,
                allocations: app.allocations,
            })),
        };
    }
    async getMonthlyStatistics(dto) {
        const { year, month } = dto;
        const monthStart = (0, dayjs_1.default)(`${year}-${month.toString().padStart(2, '0')}-01`).startOf('month');
        const monthEnd = monthStart.endOf('month');
        const emergencyApps = await this.prisma.waterApplication.findMany({
            where: {
                isEmergency: true,
                createdAt: {
                    gte: monthStart.toDate(),
                    lte: monthEnd.toDate(),
                },
            },
            include: { farmer: { select: { id: true, code: true, name: true } } },
            orderBy: [{ createdAt: 'asc' }],
        });
        const farmerStats = new Map();
        for (const app of emergencyApps) {
            if (!farmerStats.has(app.farmerId)) {
                farmerStats.set(app.farmerId, {
                    farmerId: app.farmerId,
                    farmerCode: app.farmer.code,
                    farmerName: app.farmer.name,
                    totalCount: 0,
                    approvedCount: 0,
                    rejectedCount: 0,
                    pendingCount: 0,
                    tracedCount: 0,
                });
            }
            const stats = farmerStats.get(app.farmerId);
            stats.totalCount++;
            switch (app.emergencyApprovalStatus) {
                case enums_1.EmergencyApprovalStatus.APPROVED:
                    stats.approvedCount++;
                    break;
                case enums_1.EmergencyApprovalStatus.REJECTED:
                    stats.rejectedCount++;
                    break;
                case enums_1.EmergencyApprovalStatus.PENDING_APPROVAL:
                    stats.pendingCount++;
                    break;
                case enums_1.EmergencyApprovalStatus.TO_BE_TRACED:
                    stats.tracedCount++;
                    break;
            }
        }
        const totalEmergency = emergencyApps.length;
        const totalApproved = emergencyApps.filter((a) => a.emergencyApprovalStatus === enums_1.EmergencyApprovalStatus.APPROVED).length;
        const totalRejected = emergencyApps.filter((a) => a.emergencyApprovalStatus === enums_1.EmergencyApprovalStatus.REJECTED).length;
        const totalPending = emergencyApps.filter((a) => a.emergencyApprovalStatus === enums_1.EmergencyApprovalStatus.PENDING_APPROVAL).length;
        const totalTraced = emergencyApps.filter((a) => a.emergencyApprovalStatus === enums_1.EmergencyApprovalStatus.TO_BE_TRACED).length;
        const totalReviewed = totalApproved + totalRejected;
        const approvalRate = totalReviewed > 0 ? +((totalApproved / totalReviewed) * 100).toFixed(2) : 0;
        return {
            year,
            month,
            summary: {
                totalEmergencyApplications: totalEmergency,
                totalApproved,
                totalRejected,
                totalPending,
                totalTraced,
                totalReviewed,
                overallApprovalRate: approvalRate,
            },
            farmerStatistics: Array.from(farmerStats.values()).map((s) => ({
                ...s,
                approvalRate: s.approvedCount + s.rejectedCount > 0
                    ? +((s.approvedCount / (s.approvedCount + s.rejectedCount)) * 100).toFixed(2)
                    : 0,
            })),
        };
    }
    async findOne(id) {
        const app = await this.prisma.waterApplication.findUnique({
            where: { id },
            include: {
                farmer: { select: { id: true, code: true, name: true, channel: { select: { id: true, code: true, name: true } } } },
                allocations: { include: { channel: { select: { id: true, code: true, name: true } } } },
            },
        });
        if (!app) {
            throw new common_1.NotFoundException('申请不存在');
        }
        if (!app.isEmergency) {
            throw new common_1.BadRequestException('该申请不是紧急申请');
        }
        return {
            id: app.id,
            farmerId: app.farmerId,
            farmerCode: app.farmer.code,
            farmerName: app.farmer.name,
            channel: app.farmer.channel,
            expectedFlow: app.expectedFlow,
            expectedHours: app.expectedHours,
            requestVolume: app.requestVolume,
            targetDate: (0, dayjs_1.default)(app.targetDate).format('YYYY-MM-DD'),
            originalTargetDate: (0, dayjs_1.default)(app.originalTargetDate).format('YYYY-MM-DD'),
            status: app.status,
            failReason: app.failReason,
            emergencyReason: app.emergencyReason,
            emergencyApprovalStatus: app.emergencyApprovalStatus,
            emergencyApprovedAt: app.emergencyApprovedAt,
            emergencyApprovedBy: app.emergencyApprovedBy,
            emergencyRejectReason: app.emergencyRejectReason,
            emergencyTracedAt: app.emergencyTracedAt,
            submitTime: app.submitTime,
            allocations: app.allocations,
            createdAt: app.createdAt,
        };
    }
};
exports.EmergencyApplicationService = EmergencyApplicationService;
exports.EmergencyApplicationService = EmergencyApplicationService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => credit_rating_service_1.CreditRatingService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        credit_rating_service_1.CreditRatingService])
], EmergencyApplicationService);
//# sourceMappingURL=emergency-application.service.js.map