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
exports.ApplicationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const quota_service_1 = require("../quota/quota.service");
const water_billing_service_1 = require("../water-billing/water-billing.service");
const rotational_irrigation_service_1 = require("../rotational-irrigation/rotational-irrigation.service");
const dayjs_1 = __importDefault(require("dayjs"));
const enums_1 = require("../common/enums");
function monthToQuarter(month) {
    if (month <= 3)
        return enums_1.QuotaQuarter.Q1;
    if (month <= 6)
        return enums_1.QuotaQuarter.Q2;
    if (month <= 9)
        return enums_1.QuotaQuarter.Q3;
    return enums_1.QuotaQuarter.Q4;
}
let ApplicationService = class ApplicationService {
    constructor(prisma, quotaService, waterBillingService, rotationalIrrigationService) {
        this.prisma = prisma;
        this.quotaService = quotaService;
        this.waterBillingService = waterBillingService;
        this.rotationalIrrigationService = rotationalIrrigationService;
    }
    async create(dto) {
        const farmer = await this.prisma.farmer.findUnique({ where: { id: dto.farmerId } });
        if (!farmer)
            throw new common_1.NotFoundException('用水户不存在');
        const checkResult = await this.waterBillingService.checkFarmerCanApply(dto.farmerId);
        if (!checkResult.canApply) {
            throw new common_1.BadRequestException(`提交申请被拒绝: ${checkResult.reason}`);
        }
        const target = (0, dayjs_1.default)(dto.targetDate);
        if (!target.isValid())
            throw new common_1.BadRequestException('目标日期格式错误');
        const year = target.year();
        const quarter = monthToQuarter(target.month() + 1);
        const quota = await this.quotaService.getFarmerQuota(farmer.id, year, quarter);
        if (!quota) {
            throw new common_1.BadRequestException(`${year}年${quarter}季度定额尚未设置,无法提交申请`);
        }
        const requestVolume = dto.expectedFlow * dto.expectedHours * 3600;
        const appliedAmount = await this.quotaService.getFarmerAppliedAmount(farmer.id);
        const totalAvailable = farmer.area * quota.amount;
        const remaining = totalAvailable - appliedAmount;
        if (requestVolume > remaining) {
            throw new common_1.BadRequestException(`申请量(${requestVolume.toFixed(2)}m³)超过剩余可用量(${remaining.toFixed(2)}m³),总额度:${totalAvailable.toFixed(2)}m³,已申请:${appliedAmount.toFixed(2)}m³`);
        }
        const channel = await this.prisma.channel.findUnique({ where: { id: farmer.channelId } });
        if (dto.expectedFlow > channel.maxFlow) {
            throw new common_1.BadRequestException(`申请流量(${dto.expectedFlow}m³/s)超过农渠(${channel.code})最大设计流量(${channel.maxFlow}m³/s)`);
        }
        const rotationalCheck = await this.rotationalIrrigationService.validateApplication(dto.farmerId, dto.targetDate, dto.expectedHours, requestVolume);
        const created = await this.prisma.waterApplication.create({
            data: {
                farmerId: dto.farmerId,
                expectedFlow: dto.expectedFlow,
                expectedHours: dto.expectedHours,
                requestVolume,
                submitTime: new Date(),
                targetDate: target.startOf('day').toDate(),
                originalTargetDate: target.startOf('day').toDate(),
                status: enums_1.ApplicationStatus.PENDING,
                roundId: rotationalCheck.roundId,
            },
            include: { farmer: { include: { channel: true } } },
        });
        return {
            ...created,
            warnings: rotationalCheck.warnings,
            roundName: rotationalCheck.roundName,
        };
    }
    async findAll(farmerId, targetDate, status) {
        const where = {};
        if (farmerId)
            where.farmerId = farmerId;
        if (targetDate) {
            const d = (0, dayjs_1.default)(targetDate).startOf('day');
            where.targetDate = {
                gte: d.toDate(),
                lt: d.add(1, 'day').toDate(),
            };
        }
        if (status)
            where.status = status;
        return this.prisma.waterApplication.findMany({
            where,
            include: {
                farmer: { select: { id: true, code: true, name: true, channel: { select: { id: true, code: true, name: true } } } },
                allocations: { include: { channel: { select: { id: true, code: true, name: true } } } },
                actualUsage: true,
            },
            orderBy: [{ targetDate: 'asc' }, { submitTime: 'asc' }],
        });
    }
    async findOne(id) {
        const app = await this.prisma.waterApplication.findUnique({
            where: { id },
            include: {
                farmer: { include: { channel: true } },
                allocations: { include: { channel: true } },
                actualUsage: true,
            },
        });
        if (!app)
            throw new common_1.NotFoundException('申请不存在');
        return app;
    }
    async getFarmerApplications(farmerId) {
        return this.prisma.waterApplication.findMany({
            where: { farmerId },
            include: {
                allocations: { include: { channel: { select: { id: true, code: true, name: true } } } },
                actualUsage: true,
            },
            orderBy: { submitTime: 'desc' },
        });
    }
    async cancel(id) {
        const app = await this.prisma.waterApplication.findUnique({ where: { id } });
        if (!app)
            throw new common_1.NotFoundException('申请不存在');
        if (app.status === enums_1.ApplicationStatus.EXECUTED) {
            throw new common_1.BadRequestException('已执行的申请无法取消');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.waterAllocation.deleteMany({ where: { applicationId: id } });
            return tx.waterApplication.update({
                where: { id },
                data: { status: enums_1.ApplicationStatus.CANCELLED_QUOTA, failReason: '用户取消' },
            });
        });
    }
};
exports.ApplicationService = ApplicationService;
exports.ApplicationService = ApplicationService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => water_billing_service_1.WaterBillingService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        quota_service_1.QuotaService,
        water_billing_service_1.WaterBillingService,
        rotational_irrigation_service_1.RotationalIrrigationService])
], ApplicationService);
//# sourceMappingURL=application.service.js.map