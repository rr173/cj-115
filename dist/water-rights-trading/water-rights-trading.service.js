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
exports.WaterRightsTradingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const water_billing_service_1 = require("../water-billing/water-billing.service");
const quota_service_1 = require("../quota/quota.service");
const schedule_1 = require("@nestjs/schedule");
const dayjs_1 = __importDefault(require("dayjs"));
const enums_1 = require("../common/enums");
const SELL_ORDER_EXPIRE_DAYS = 7;
const PRICE_MIN_RATIO = 0.5;
const PRICE_MAX_RATIO = 3.0;
function monthToQuarter(month) {
    if (month <= 3)
        return enums_1.QuotaQuarter.Q1;
    if (month <= 6)
        return enums_1.QuotaQuarter.Q2;
    if (month <= 9)
        return enums_1.QuotaQuarter.Q3;
    return enums_1.QuotaQuarter.Q4;
}
let WaterRightsTradingService = class WaterRightsTradingService {
    constructor(prisma, waterBillingService, quotaService) {
        this.prisma = prisma;
        this.waterBillingService = waterBillingService;
        this.quotaService = quotaService;
    }
    async ensureWaterRightsAccount(farmerId, year, quarter) {
        const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId } });
        if (!farmer)
            throw new common_1.NotFoundException('用水户不存在');
        const quota = await this.quotaService.getFarmerQuota(farmerId, year, quarter);
        if (!quota)
            throw new common_1.BadRequestException(`${year}年${quarter}季度定额尚未设置,无法创建水权账户`);
        const initialQuota = farmer.area * quota.amount;
        const existing = await this.prisma.waterRightsAccount.findUnique({
            where: { farmerId_year_quarter: { farmerId, year, quarter: quarter } },
        });
        if (existing) {
            const needsUpdate = existing.initialQuota !== initialQuota;
            if (needsUpdate) {
                return this.prisma.waterRightsAccount.update({
                    where: { id: existing.id },
                    data: { initialQuota, updatedAt: new Date() },
                });
            }
            return existing;
        }
        return this.prisma.waterRightsAccount.create({
            data: { farmerId, year, quarter: quarter, initialQuota },
        });
    }
    async getAvailableQuota(farmerId, year, quarter) {
        const account = await this.prisma.waterRightsAccount.findUnique({
            where: { farmerId_year_quarter: { farmerId, year, quarter: quarter } },
        });
        if (!account) {
            const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId } });
            if (!farmer)
                throw new common_1.NotFoundException('用水户不存在');
            const quota = await this.quotaService.getFarmerQuota(farmerId, year, quarter);
            if (!quota)
                return 0;
            return farmer.area * quota.amount;
        }
        const usedVolume = await this.calculateUsedVolume(farmerId, year, quarter);
        const available = account.initialQuota + account.boughtVolume - account.soldVolume - usedVolume - account.frozenVolume;
        return Math.max(0, available);
    }
    async calculateUsedVolume(farmerId, year, quarter) {
        const quarterMonths = {
            Q1: [1, 2, 3],
            Q2: [4, 5, 6],
            Q3: [7, 8, 9],
            Q4: [10, 11, 12],
        };
        const months = quarterMonths[quarter];
        if (!months)
            return 0;
        const apps = await this.prisma.waterApplication.findMany({
            where: {
                farmerId,
                status: { in: [enums_1.ApplicationStatus.SCHEDULED, enums_1.ApplicationStatus.EXECUTED] },
            },
            select: { requestVolume: true, targetDate: true },
        });
        let total = 0;
        for (const app of apps) {
            const d = (0, dayjs_1.default)(app.targetDate);
            if (d.year() === year && months.includes(d.month() + 1)) {
                total += app.requestVolume;
            }
        }
        return total;
    }
    async createSellOrder(dto) {
        const farmer = await this.prisma.farmer.findUnique({ where: { id: dto.sellerId } });
        if (!farmer)
            throw new common_1.NotFoundException('用水户不存在');
        const schemeResult = await this.waterBillingService.findApplicableSchemeForFarmer(dto.sellerId);
        if (!schemeResult)
            throw new common_1.BadRequestException('该用水户未绑定水价方案,无法挂牌交易');
        const { scheme } = schemeResult;
        const minPrice = scheme.basePrice * PRICE_MIN_RATIO;
        const maxPrice = scheme.basePrice * PRICE_MAX_RATIO;
        if (dto.unitPrice < minPrice) {
            throw new common_1.BadRequestException(`单价不能低于基准水价的50%(最低${minPrice.toFixed(2)}元/m³)`);
        }
        if (dto.unitPrice > maxPrice) {
            throw new common_1.BadRequestException(`单价不能高于基准水价的3倍(最高${maxPrice.toFixed(2)}元/m³)`);
        }
        const account = await this.ensureWaterRightsAccount(dto.sellerId, dto.year, dto.quarter);
        const usedVolume = await this.calculateUsedVolume(dto.sellerId, dto.year, dto.quarter);
        const available = account.initialQuota + account.boughtVolume - account.soldVolume - usedVolume - account.frozenVolume;
        if (dto.sellVolume > available) {
            throw new common_1.BadRequestException(`出售量(${dto.sellVolume}m³)超过可用额度(${available.toFixed(2)}m³),可用=初始额度(${account.initialQuota})+买入(${account.boughtVolume})-已用(${usedVolume.toFixed(2)})-已卖出(${account.soldVolume})-冻结(${account.frozenVolume})`);
        }
        if (dto.sellVolume <= 0) {
            throw new common_1.BadRequestException('出售量必须大于0');
        }
        const now = new Date();
        const expiresAt = (0, dayjs_1.default)(now).add(SELL_ORDER_EXPIRE_DAYS, 'day').toDate();
        const order = await this.prisma.$transaction(async (tx) => {
            await tx.waterRightsAccount.update({
                where: { id: account.id },
                data: {
                    frozenVolume: account.frozenVolume + dto.sellVolume,
                    updatedAt: new Date(),
                },
            });
            return tx.waterRightsSellOrder.create({
                data: {
                    sellerId: dto.sellerId,
                    year: dto.year,
                    quarter: dto.quarter,
                    sellVolume: dto.sellVolume,
                    remainingVolume: dto.sellVolume,
                    unitPrice: dto.unitPrice,
                    status: enums_1.SellOrderStatus.ACTIVE,
                    expiresAt,
                },
                include: { seller: { select: { id: true, code: true, name: true } } },
            });
        });
        return {
            ...order,
            statusName: enums_1.SellOrderStatusNames[order.status],
            expiresIn: `${SELL_ORDER_EXPIRE_DAYS}天`,
        };
    }
    async buySellOrder(dto) {
        const order = await this.prisma.waterRightsSellOrder.findUnique({
            where: { id: dto.sellOrderId },
            include: { seller: { select: { id: true, code: true, name: true } } },
        });
        if (!order)
            throw new common_1.NotFoundException('卖单不存在');
        if (order.status !== enums_1.SellOrderStatus.ACTIVE && order.status !== enums_1.SellOrderStatus.PARTIAL) {
            throw new common_1.BadRequestException(`该卖单状态为${enums_1.SellOrderStatusNames[order.status]},无法购买`);
        }
        if (dto.buyerId === order.sellerId) {
            throw new common_1.BadRequestException('不能购买自己发布的卖单');
        }
        if (dto.buyVolume > order.remainingVolume) {
            throw new common_1.BadRequestException(`购买量(${dto.buyVolume}m³)超过卖单剩余量(${order.remainingVolume}m³)`);
        }
        if (dto.buyVolume <= 0) {
            throw new common_1.BadRequestException('购买量必须大于0');
        }
        const buyer = await this.prisma.farmer.findUnique({ where: { id: dto.buyerId } });
        if (!buyer)
            throw new common_1.NotFoundException('买方用水户不存在');
        const totalAmount = +(dto.buyVolume * order.unitPrice).toFixed(2);
        const trade = await this.prisma.$transaction(async (tx) => {
            const sellerAccount = await tx.waterRightsAccount.findUnique({
                where: { farmerId_year_quarter: { farmerId: order.sellerId, year: order.year, quarter: order.quarter } },
            });
            if (!sellerAccount)
                throw new common_1.BadRequestException('卖方水权账户不存在');
            const newFrozenVolume = Math.max(0, sellerAccount.frozenVolume - dto.buyVolume);
            await tx.waterRightsAccount.update({
                where: { id: sellerAccount.id },
                data: {
                    frozenVolume: newFrozenVolume,
                    soldVolume: sellerAccount.soldVolume + dto.buyVolume,
                    updatedAt: new Date(),
                },
            });
            let buyerAccount = await tx.waterRightsAccount.findUnique({
                where: { farmerId_year_quarter: { farmerId: dto.buyerId, year: order.year, quarter: order.quarter } },
            });
            if (!buyerAccount) {
                const quota = await tx.quota.findUnique({
                    where: { farmerId_year_quarter: { farmerId: dto.buyerId, year: order.year, quarter: order.quarter } },
                });
                if (!quota)
                    throw new common_1.BadRequestException('买方该季度定额尚未设置');
                const bFarmer = await tx.farmer.findUnique({ where: { id: dto.buyerId }, select: { area: true } });
                buyerAccount = await tx.waterRightsAccount.create({
                    data: {
                        farmerId: dto.buyerId,
                        year: order.year,
                        quarter: order.quarter,
                        initialQuota: bFarmer.area * quota.amount,
                        boughtVolume: dto.buyVolume,
                    },
                });
            }
            else {
                await tx.waterRightsAccount.update({
                    where: { id: buyerAccount.id },
                    data: {
                        boughtVolume: buyerAccount.boughtVolume + dto.buyVolume,
                        updatedAt: new Date(),
                    },
                });
            }
            const newRemainingVolume = +(order.remainingVolume - dto.buyVolume).toFixed(4);
            const newStatus = newRemainingVolume <= 0.001 ? enums_1.SellOrderStatus.COMPLETED : enums_1.SellOrderStatus.PARTIAL;
            await tx.waterRightsSellOrder.update({
                where: { id: order.id },
                data: {
                    remainingVolume: Math.max(0, newRemainingVolume),
                    status: newStatus,
                    updatedAt: new Date(),
                },
            });
            return tx.waterRightsTradeRecord.create({
                data: {
                    sellOrderId: order.id,
                    buyerId: dto.buyerId,
                    sellerId: order.sellerId,
                    year: order.year,
                    quarter: order.quarter,
                    volume: dto.buyVolume,
                    unitPrice: order.unitPrice,
                    totalAmount,
                },
                include: {
                    buyer: { select: { id: true, code: true, name: true } },
                    seller: { select: { id: true, code: true, name: true } },
                },
            });
        });
        return {
            tradeId: trade.id,
            sellOrderId: order.id,
            buyer: trade.buyer,
            seller: trade.seller,
            volume: trade.volume,
            unitPrice: trade.unitPrice,
            totalAmount: trade.totalAmount,
            year: trade.year,
            quarter: trade.quarter,
            createdAt: trade.createdAt,
        };
    }
    async cancelSellOrder(sellOrderId) {
        const order = await this.prisma.waterRightsSellOrder.findUnique({ where: { id: sellOrderId } });
        if (!order)
            throw new common_1.NotFoundException('卖单不存在');
        if (order.status !== enums_1.SellOrderStatus.ACTIVE && order.status !== enums_1.SellOrderStatus.PARTIAL) {
            throw new common_1.BadRequestException(`状态为${enums_1.SellOrderStatusNames[order.status]}的卖单无法撤单`);
        }
        const unfreezeVolume = order.remainingVolume;
        await this.prisma.$transaction(async (tx) => {
            await tx.waterRightsSellOrder.update({
                where: { id: sellOrderId },
                data: { status: enums_1.SellOrderStatus.CANCELLED, updatedAt: new Date() },
            });
            const account = await tx.waterRightsAccount.findUnique({
                where: { farmerId_year_quarter: { farmerId: order.sellerId, year: order.year, quarter: order.quarter } },
            });
            if (account) {
                await tx.waterRightsAccount.update({
                    where: { id: account.id },
                    data: {
                        frozenVolume: Math.max(0, account.frozenVolume - unfreezeVolume),
                        updatedAt: new Date(),
                    },
                });
            }
        });
        return { message: '撤单成功', unfreezeVolume };
    }
    async getMarketSellOrders(dto) {
        await this.expireOldOrders();
        const where = {
            status: { in: [enums_1.SellOrderStatus.ACTIVE, enums_1.SellOrderStatus.PARTIAL] },
        };
        if (dto.year)
            where.year = dto.year;
        if (dto.quarter)
            where.quarter = dto.quarter;
        const orders = await this.prisma.waterRightsSellOrder.findMany({
            where,
            include: { seller: { select: { id: true, code: true, name: true } } },
            orderBy: [{ unitPrice: 'asc' }, { createdAt: 'asc' }],
        });
        return orders.map((o) => ({
            id: o.id,
            seller: o.seller,
            year: o.year,
            quarter: o.quarter,
            sellVolume: o.sellVolume,
            remainingVolume: o.remainingVolume,
            unitPrice: o.unitPrice,
            status: o.status,
            statusName: enums_1.SellOrderStatusNames[o.status],
            createdAt: o.createdAt,
            expiresAt: o.expiresAt,
        }));
    }
    async getTradeHistory(dto) {
        const farmer = await this.prisma.farmer.findUnique({ where: { id: dto.farmerId } });
        if (!farmer)
            throw new common_1.NotFoundException('用水户不存在');
        const buyTrades = await this.prisma.waterRightsTradeRecord.findMany({
            where: { buyerId: dto.farmerId },
            include: {
                seller: { select: { id: true, code: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        const sellTrades = await this.prisma.waterRightsTradeRecord.findMany({
            where: { sellerId: dto.farmerId },
            include: {
                buyer: { select: { id: true, code: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return {
            farmer: { id: farmer.id, code: farmer.code, name: farmer.name },
            buyHistory: buyTrades.map((t) => ({
                id: t.id,
                sellOrderId: t.sellOrderId,
                counterparty: t.seller,
                direction: '买入',
                year: t.year,
                quarter: t.quarter,
                volume: t.volume,
                unitPrice: t.unitPrice,
                totalAmount: t.totalAmount,
                createdAt: t.createdAt,
            })),
            sellHistory: sellTrades.map((t) => ({
                id: t.id,
                sellOrderId: t.sellOrderId,
                counterparty: t.buyer,
                direction: '卖出',
                year: t.year,
                quarter: t.quarter,
                volume: t.volume,
                unitPrice: t.unitPrice,
                totalAmount: t.totalAmount,
                createdAt: t.createdAt,
            })),
        };
    }
    async getWaterRightsAccountDetail(dto) {
        const farmer = await this.prisma.farmer.findUnique({ where: { id: dto.farmerId } });
        if (!farmer)
            throw new common_1.NotFoundException('用水户不存在');
        const account = await this.prisma.waterRightsAccount.findUnique({
            where: { farmerId_year_quarter: { farmerId: dto.farmerId, year: dto.year, quarter: dto.quarter } },
        });
        if (!account) {
            const quota = await this.quotaService.getFarmerQuota(dto.farmerId, dto.year, dto.quarter);
            const initialQuota = quota ? farmer.area * quota.amount : 0;
            const usedVolume = await this.calculateUsedVolume(dto.farmerId, dto.year, dto.quarter);
            return {
                farmer: { id: farmer.id, code: farmer.code, name: farmer.name },
                year: dto.year,
                quarter: dto.quarter,
                initialQuota,
                boughtVolume: 0,
                soldVolume: 0,
                usedVolume: +usedVolume.toFixed(4),
                frozenVolume: 0,
                availableVolume: +Math.max(0, initialQuota - usedVolume).toFixed(4),
                accountCreated: false,
            };
        }
        const usedVolume = await this.calculateUsedVolume(dto.farmerId, dto.year, dto.quarter);
        const available = account.initialQuota + account.boughtVolume - account.soldVolume - usedVolume - account.frozenVolume;
        return {
            farmer: { id: farmer.id, code: farmer.code, name: farmer.name },
            year: dto.year,
            quarter: dto.quarter,
            initialQuota: account.initialQuota,
            boughtVolume: account.boughtVolume,
            soldVolume: account.soldVolume,
            usedVolume: +usedVolume.toFixed(4),
            frozenVolume: account.frozenVolume,
            availableVolume: +Math.max(0, available).toFixed(4),
            accountCreated: true,
        };
    }
    async expireOldOrders() {
        const now = new Date();
        const expiredOrders = await this.prisma.waterRightsSellOrder.findMany({
            where: {
                status: { in: [enums_1.SellOrderStatus.ACTIVE, enums_1.SellOrderStatus.PARTIAL] },
                expiresAt: { lte: now },
            },
        });
        for (const order of expiredOrders) {
            await this.prisma.$transaction(async (tx) => {
                await tx.waterRightsSellOrder.update({
                    where: { id: order.id },
                    data: { status: enums_1.SellOrderStatus.EXPIRED, updatedAt: new Date() },
                });
                const account = await tx.waterRightsAccount.findUnique({
                    where: { farmerId_year_quarter: { farmerId: order.sellerId, year: order.year, quarter: order.quarter } },
                });
                if (account) {
                    await tx.waterRightsAccount.update({
                        where: { id: account.id },
                        data: {
                            frozenVolume: Math.max(0, account.frozenVolume - order.remainingVolume),
                            updatedAt: new Date(),
                        },
                    });
                }
            });
        }
        return { expiredCount: expiredOrders.length };
    }
    async handleExpireOrdersCron() {
        try {
            const result = await this.expireOldOrders();
            console.log(`[Cron] 水权交易过期检查完成, 处理${result.expiredCount}条过期卖单`);
        }
        catch (e) {
            console.error('[Cron] 水权交易过期检查失败:', e);
        }
    }
};
exports.WaterRightsTradingService = WaterRightsTradingService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM, { name: 'expire_water_rights_orders' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WaterRightsTradingService.prototype, "handleExpireOrdersCron", null);
exports.WaterRightsTradingService = WaterRightsTradingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        water_billing_service_1.WaterBillingService,
        quota_service_1.QuotaService])
], WaterRightsTradingService);
//# sourceMappingURL=water-rights-trading.service.js.map