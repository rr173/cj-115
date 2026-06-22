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
const water_rights_trading_service_1 = require("../water-rights-trading/water-rights-trading.service");
const credit_rating_service_1 = require("../credit-rating/credit-rating.service");
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
    constructor(prisma, quotaService, waterBillingService, rotationalIrrigationService, waterRightsTradingService, creditRatingService) {
        this.prisma = prisma;
        this.quotaService = quotaService;
        this.waterBillingService = waterBillingService;
        this.rotationalIrrigationService = rotationalIrrigationService;
        this.waterRightsTradingService = waterRightsTradingService;
        this.creditRatingService = creditRatingService;
    }
    async create(dto) {
        const farmer = await this.prisma.farmer.findUnique({ where: { id: dto.farmerId } });
        if (!farmer)
            throw new common_1.NotFoundException('用水户不存在');
        const isEmergency = dto.isEmergency === true;
        if (isEmergency && !dto.emergencyReason) {
            throw new common_1.BadRequestException('紧急申请必须填写紧急原因');
        }
        if (isEmergency) {
            const now = (0, dayjs_1.default)();
            const monthStart = now.startOf('month');
            const monthEnd = now.endOf('month');
            const emergencyCount = await this.prisma.waterApplication.count({
                where: {
                    farmerId: dto.farmerId,
                    isEmergency: true,
                    createdAt: {
                        gte: monthStart.toDate(),
                        lte: monthEnd.toDate(),
                    },
                },
            });
            if (emergencyCount >= 3) {
                throw new common_1.BadRequestException('本月紧急申请次数已达上限(3次),请使用普通申请通道');
            }
        }
        const checkResult = await this.waterBillingService.checkFarmerCanApply(dto.farmerId);
        if (!checkResult.canApply) {
            throw new common_1.BadRequestException(`提交申请被拒绝: ${checkResult.reason}`);
        }
        if (!isEmergency) {
            const dCheck = await this.creditRatingService.checkDFarmerCanApply(dto.farmerId);
            if (!dCheck.canApply) {
                throw new common_1.BadRequestException(`提交申请被拒绝: ${dCheck.reason}`);
            }
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
        const creditMultiplier = isEmergency ? 1.0 : await this.creditRatingService.getQuotaMultiplier(dto.farmerId);
        const requestVolume = dto.expectedFlow * dto.expectedHours * 3600;
        const availableQuota = isEmergency
            ? quota.amount
            : await this.waterRightsTradingService.getAvailableQuota(farmer.id, year, quarter);
        const creditAdjustedQuota = +(availableQuota * creditMultiplier).toFixed(4);
        if (requestVolume > creditAdjustedQuota) {
            const msg = isEmergency
                ? `申请量(${requestVolume.toFixed(2)}m³)超过原始季度定额(${quota.amount.toFixed(2)}m³),紧急申请按原始定额计算上限`
                : `申请量(${requestVolume.toFixed(2)}m³)超过信用调整后可用额度(${creditAdjustedQuota.toFixed(2)}m³,原额度${availableQuota.toFixed(2)}m³×信用系数${creditMultiplier}),额度不足可前往水权交易市场购买`;
            throw new common_1.BadRequestException(msg);
        }
        const channel = await this.prisma.channel.findUnique({ where: { id: farmer.channelId } });
        if (dto.expectedFlow > channel.maxFlow) {
            throw new common_1.BadRequestException(`申请流量(${dto.expectedFlow}m³/s)超过农渠(${channel.code})最大设计流量(${channel.maxFlow}m³/s)`);
        }
        let rotationalCheck = { roundId: null, warnings: [], roundName: null };
        if (!isEmergency) {
            rotationalCheck = await this.rotationalIrrigationService.validateApplication(dto.farmerId, dto.targetDate, dto.expectedHours, requestVolume);
        }
        const createData = {
            farmerId: dto.farmerId,
            expectedFlow: dto.expectedFlow,
            expectedHours: dto.expectedHours,
            requestVolume,
            submitTime: new Date(),
            targetDate: target.startOf('day').toDate(),
            originalTargetDate: target.startOf('day').toDate(),
            status: enums_1.ApplicationStatus.PENDING,
            roundId: rotationalCheck.roundId,
        };
        if (isEmergency) {
            createData.isEmergency = true;
            createData.emergencyReason = dto.emergencyReason;
        }
        const created = await this.prisma.waterApplication.create({
            data: createData,
            include: { farmer: { include: { channel: true } } },
        });
        const result = {
            ...created,
            creditMultiplier,
            warnings: rotationalCheck.warnings,
            roundName: rotationalCheck.roundName,
        };
        if (isEmergency) {
            result.isEmergency = true;
            result.emergencyReason = dto.emergencyReason;
            result.notice = '紧急申请将优先于普通申请编排,需管理员事后审批';
        }
        return result;
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
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => water_rights_trading_service_1.WaterRightsTradingService))),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => credit_rating_service_1.CreditRatingService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        quota_service_1.QuotaService,
        water_billing_service_1.WaterBillingService,
        rotational_irrigation_service_1.RotationalIrrigationService,
        water_rights_trading_service_1.WaterRightsTradingService,
        credit_rating_service_1.CreditRatingService])
], ApplicationService);
//# sourceMappingURL=application.service.js.map