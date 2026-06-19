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
exports.WaterBillingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const schedule_1 = require("@nestjs/schedule");
const dayjs_1 = __importDefault(require("dayjs"));
const enums_1 = require("../common/enums");
const LATE_FEE_RATE = 0.0005;
const OVERDUE_DAYS = 30;
const FREEZE_OVERDUE_MONTHS = 2;
const SUBSIDY_THRESHOLD_RATIO = 0.8;
const SUBSIDY_PRICE_RATIO = 0.5;
const UNREPORTED_ESTIMATE_RATIO = 0.9;
function monthToQuarter(month) {
    if (month <= 3)
        return enums_1.QuotaQuarter.Q1;
    if (month <= 6)
        return enums_1.QuotaQuarter.Q2;
    if (month <= 9)
        return enums_1.QuotaQuarter.Q3;
    return enums_1.QuotaQuarter.Q4;
}
let WaterBillingService = class WaterBillingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createScheme(dto) {
        const existing = await this.prisma.waterPriceScheme.findUnique({ where: { code: dto.code } });
        if (existing)
            throw new common_1.BadRequestException('水价方案编码已存在');
        return this.prisma.waterPriceScheme.create({
            data: {
                name: dto.name,
                code: dto.code,
                basePrice: dto.basePrice,
                tier1Multiplier: dto.tier1Multiplier ?? 1.0,
                tier2Threshold: dto.tier2Threshold ?? 1.3,
                tier2Multiplier: dto.tier2Multiplier ?? 1.5,
                tier3Multiplier: dto.tier3Multiplier ?? 2.0,
                description: dto.description,
                isActive: dto.isActive ?? true,
            },
        });
    }
    async updateScheme(id, dto) {
        const scheme = await this.prisma.waterPriceScheme.findUnique({ where: { id } });
        if (!scheme)
            throw new common_1.NotFoundException('水价方案不存在');
        return this.prisma.waterPriceScheme.update({
            where: { id },
            data: {
                ...dto,
                updatedAt: new Date(),
            },
        });
    }
    async listSchemes() {
        return this.prisma.waterPriceScheme.findMany({
            include: { channelBindings: { include: { channel: { select: { id: true, code: true, name: true, level: true } } } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getScheme(id) {
        const scheme = await this.prisma.waterPriceScheme.findUnique({
            where: { id },
            include: { channelBindings: { include: { channel: { select: { id: true, code: true, name: true, level: true } } } } },
        });
        if (!scheme)
            throw new common_1.NotFoundException('水价方案不存在');
        return scheme;
    }
    async deleteScheme(id) {
        const scheme = await this.prisma.waterPriceScheme.findUnique({ where: { id } });
        if (!scheme)
            throw new common_1.NotFoundException('水价方案不存在');
        const hasBindings = await this.prisma.channelPriceBinding.count({ where: { schemeId: id } });
        if (hasBindings > 0)
            throw new common_1.BadRequestException('该方案已绑定渠道，无法删除');
        const hasBills = await this.prisma.waterBill.count({ where: { schemeId: id } });
        if (hasBills > 0)
            throw new common_1.BadRequestException('该方案已有账单记录，无法删除');
        return this.prisma.waterPriceScheme.delete({ where: { id } });
    }
    async bindChannelPriceScheme(dto) {
        const channel = await this.prisma.channel.findUnique({ where: { id: dto.channelId } });
        if (!channel)
            throw new common_1.NotFoundException('渠道不存在');
        const scheme = await this.prisma.waterPriceScheme.findUnique({ where: { id: dto.schemeId } });
        if (!scheme)
            throw new common_1.NotFoundException('水价方案不存在');
        const existing = await this.prisma.channelPriceBinding.findUnique({ where: { channelId: dto.channelId } });
        if (existing) {
            return this.prisma.channelPriceBinding.update({
                where: { id: existing.id },
                data: { schemeId: dto.schemeId },
            });
        }
        return this.prisma.channelPriceBinding.create({
            data: {
                channelId: dto.channelId,
                schemeId: dto.schemeId,
            },
        });
    }
    async unbindChannelPriceScheme(channelId) {
        const existing = await this.prisma.channelPriceBinding.findUnique({ where: { channelId } });
        if (!existing)
            throw new common_1.NotFoundException('该渠道未绑定水价方案');
        return this.prisma.channelPriceBinding.delete({ where: { id: existing.id } });
    }
    async findApplicableSchemeForFarmer(farmerId) {
        const farmer = await this.prisma.farmer.findUnique({
            where: { id: farmerId },
            select: {
                id: true,
                channelId: true,
                channel: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        level: true,
                        parentId: true,
                    },
                },
            },
        });
        if (!farmer)
            throw new common_1.NotFoundException('用水户不存在');
        let currentChannel = farmer.channel;
        const visitedChannelIds = new Set();
        while (currentChannel && !visitedChannelIds.has(currentChannel.id)) {
            visitedChannelIds.add(currentChannel.id);
            const binding = await this.prisma.channelPriceBinding.findUnique({
                where: { channelId: currentChannel.id },
                include: { scheme: true },
            });
            if (binding && binding.scheme.isActive) {
                return { scheme: binding.scheme, channel: currentChannel };
            }
            if (!currentChannel.parentId)
                break;
            currentChannel = await this.prisma.channel.findUnique({
                where: { id: currentChannel.parentId },
                select: { id: true, code: true, name: true, level: true, parentId: true },
            });
        }
        return null;
    }
    async getMonthQuotaVolume(farmerId, year, month) {
        const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId }, select: { area: true } });
        if (!farmer)
            return 0;
        const quarter = monthToQuarter(month);
        const quota = await this.prisma.quota.findUnique({
            where: { farmerId_year_quarter: { farmerId, year, quarter } },
        });
        if (!quota)
            return 0;
        return farmer.area * quota.amount;
    }
    async calculateMonthWaterUsage(farmerId, year, month) {
        const monthStart = (0, dayjs_1.default)(`${year}-${String(month).padStart(2, '0')}-01`).startOf('month');
        const monthEnd = monthStart.endOf('month');
        const applications = await this.prisma.waterApplication.findMany({
            where: {
                farmerId,
                targetDate: { gte: monthStart.toDate(), lte: monthEnd.toDate() },
                status: enums_1.ApplicationStatus.EXECUTED,
            },
            include: { actualUsage: true },
        });
        let totalVolume = 0;
        const details = [];
        for (const app of applications) {
            if (app.actualUsage) {
                totalVolume += app.actualUsage.actualVolume;
                details.push({
                    applicationId: app.id,
                    actualVolume: app.actualUsage.actualVolume,
                    estimated: false,
                    plannedVolume: app.requestVolume,
                });
            }
            else {
                const estimatedVolume = app.requestVolume * UNREPORTED_ESTIMATE_RATIO;
                totalVolume += estimatedVolume;
                details.push({
                    applicationId: app.id,
                    actualVolume: estimatedVolume,
                    estimated: true,
                    plannedVolume: app.requestVolume,
                });
            }
        }
        return { totalVolume: +totalVolume.toFixed(4), details };
    }
    calculateTieredPricing(totalVolume, quotaVolume, scheme) {
        const tier1Price = scheme.basePrice * scheme.tier1Multiplier;
        const tier2Price = scheme.basePrice * scheme.tier2Multiplier;
        const tier3Price = scheme.basePrice * scheme.tier3Multiplier;
        const tier2StartVolume = quotaVolume * scheme.tier2Threshold;
        let tier1Volume = 0;
        let tier2Volume = 0;
        let tier3Volume = 0;
        if (totalVolume <= quotaVolume) {
            tier1Volume = totalVolume;
        }
        else if (totalVolume <= tier2StartVolume) {
            tier1Volume = quotaVolume;
            tier2Volume = totalVolume - quotaVolume;
        }
        else {
            tier1Volume = quotaVolume;
            tier2Volume = tier2StartVolume - quotaVolume;
            tier3Volume = totalVolume - tier2StartVolume;
        }
        const tier1Amount = +(tier1Volume * tier1Price).toFixed(2);
        const tier2Amount = +(tier2Volume * tier2Price).toFixed(2);
        const tier3Amount = +(tier3Volume * tier3Price).toFixed(2);
        const baseAmount = +(tier1Amount + tier2Amount + tier3Amount).toFixed(2);
        const tierDetails = [];
        if (tier1Volume > 0) {
            tierDetails.push({
                tier: 1,
                rangeStart: 0,
                rangeEnd: quotaVolume,
                unitPrice: +tier1Price.toFixed(4),
                volume: +tier1Volume.toFixed(4),
                amount: tier1Amount,
                description: `定额内(0-${quotaVolume.toFixed(2)}m³),单价${tier1Price.toFixed(2)}元/m³`,
            });
        }
        if (tier2Volume > 0) {
            tierDetails.push({
                tier: 2,
                rangeStart: quotaVolume,
                rangeEnd: tier2StartVolume,
                unitPrice: +tier2Price.toFixed(4),
                volume: +tier2Volume.toFixed(4),
                amount: tier2Amount,
                description: `超定额0-30%(${quotaVolume.toFixed(2)}-${tier2StartVolume.toFixed(2)}m³),单价${tier2Price.toFixed(2)}元/m³`,
            });
        }
        if (tier3Volume > 0) {
            tierDetails.push({
                tier: 3,
                rangeStart: tier2StartVolume,
                rangeEnd: null,
                unitPrice: +tier3Price.toFixed(4),
                volume: +tier3Volume.toFixed(4),
                amount: tier3Amount,
                description: `超定额30%以上(${tier2StartVolume.toFixed(2)}m³以上),单价${tier3Price.toFixed(2)}元/m³`,
            });
        }
        return {
            tier1Volume: +tier1Volume.toFixed(4),
            tier1Amount,
            tier2Volume: +tier2Volume.toFixed(4),
            tier2Amount,
            tier3Volume: +tier3Volume.toFixed(4),
            tier3Amount,
            baseAmount,
            tierDetails,
        };
    }
    calculateSubsidy(totalVolume, quotaVolume, scheme) {
        const threshold = quotaVolume * SUBSIDY_THRESHOLD_RATIO;
        if (totalVolume >= threshold) {
            return { subsidyAmount: 0, subsidyVolume: 0 };
        }
        const subsidyVolume = threshold - totalVolume;
        const subsidyAmount = subsidyVolume * scheme.basePrice * SUBSIDY_PRICE_RATIO;
        return {
            subsidyVolume: +subsidyVolume.toFixed(4),
            subsidyAmount: +subsidyAmount.toFixed(2),
        };
    }
    async generateMonthlyBills(dto) {
        const { year, month } = dto;
        const existingBills = await this.prisma.waterBill.findMany({
            where: { billingYear: year, billingMonth: month },
        });
        if (existingBills.length > 0) {
            throw new common_1.BadRequestException(`${year}年${month}月账单已生成，如需重新生成请先删除`);
        }
        const farmers = await this.prisma.farmer.findMany({
            select: { id: true, name: true, code: true },
        });
        const results = [];
        let successCount = 0;
        let skipCount = 0;
        for (const farmer of farmers) {
            const schemeResult = await this.findApplicableSchemeForFarmer(farmer.id);
            if (!schemeResult) {
                skipCount++;
                continue;
            }
            const { scheme } = schemeResult;
            const quotaVolume = await this.getMonthQuotaVolume(farmer.id, year, month);
            const usageResult = await this.calculateMonthWaterUsage(farmer.id, year, month);
            if (usageResult.totalVolume === 0) {
                skipCount++;
                continue;
            }
            const tieredResult = this.calculateTieredPricing(usageResult.totalVolume, quotaVolume, scheme);
            const subsidyResult = this.calculateSubsidy(usageResult.totalVolume, quotaVolume, scheme);
            const amountAfterSubsidy = Math.max(0, tieredResult.baseAmount - subsidyResult.subsidyAmount);
            const totalAmount = +amountAfterSubsidy.toFixed(2);
            const dueDate = (0, dayjs_1.default)().add(OVERDUE_DAYS, 'day').toDate();
            const bill = await this.prisma.waterBill.create({
                data: {
                    farmerId: farmer.id,
                    schemeId: scheme.id,
                    billingYear: year,
                    billingMonth: month,
                    quotaVolume: +quotaVolume.toFixed(4),
                    totalVolume: usageResult.totalVolume,
                    tier1Volume: tieredResult.tier1Volume,
                    tier1Amount: tieredResult.tier1Amount,
                    tier2Volume: tieredResult.tier2Volume,
                    tier2Amount: tieredResult.tier2Amount,
                    tier3Volume: tieredResult.tier3Volume,
                    tier3Amount: tieredResult.tier3Amount,
                    baseAmount: tieredResult.baseAmount,
                    subsidyAmount: subsidyResult.subsidyAmount,
                    subsidyVolume: subsidyResult.subsidyVolume,
                    totalAmount,
                    paidAmount: 0,
                    remainingAmount: totalAmount,
                    status: enums_1.WaterBillStatus.UNPAID,
                    dueDate,
                },
            });
            for (const td of tieredResult.tierDetails) {
                await this.prisma.billTierDetail.create({
                    data: {
                        billId: bill.id,
                        tier: td.tier,
                        rangeStart: td.rangeStart,
                        rangeEnd: td.rangeEnd,
                        unitPrice: td.unitPrice,
                        volume: td.volume,
                        amount: td.amount,
                    },
                });
            }
            await this.ensureFarmerAccount(farmer.id);
            successCount++;
            results.push({
                farmerId: farmer.id,
                farmerName: farmer.name,
                billId: bill.id,
                totalAmount: bill.totalAmount,
            });
        }
        return {
            year,
            month,
            totalFarmers: farmers.length,
            successCount,
            skipCount,
            bills: results,
        };
    }
    async ensureFarmerAccount(farmerId) {
        const existing = await this.prisma.farmerAccount.findUnique({ where: { farmerId } });
        if (!existing) {
            return this.prisma.farmerAccount.create({
                data: { farmerId, isFrozen: false, lastOverdueMonths: 0 },
            });
        }
        return existing;
    }
    async getFarmerBills(dto) {
        const { farmerId, year, month } = dto;
        const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId } });
        if (!farmer)
            throw new common_1.NotFoundException('用水户不存在');
        const where = { farmerId };
        if (year)
            where.billingYear = year;
        if (month)
            where.billingMonth = month;
        await this.updateBillOverdueStatus(farmerId);
        const bills = await this.prisma.waterBill.findMany({
            where,
            include: {
                scheme: true,
                tierDetails: { orderBy: { tier: 'asc' } },
                payments: { orderBy: { paidAt: 'desc' } },
            },
            orderBy: [{ billingYear: 'desc' }, { billingMonth: 'desc' }],
        });
        return bills.map((bill) => this.formatBillDetail(bill, farmer));
    }
    async getBillDetail(billId) {
        const bill = await this.prisma.waterBill.findUnique({
            where: { id: billId },
            include: {
                farmer: true,
                scheme: true,
                tierDetails: { orderBy: { tier: 'asc' } },
                payments: { orderBy: { paidAt: 'desc' } },
            },
        });
        if (!bill)
            throw new common_1.NotFoundException('账单不存在');
        await this.updateSingleBillOverdue(bill);
        const reloaded = await this.prisma.waterBill.findUnique({
            where: { id: billId },
            include: {
                farmer: true,
                scheme: true,
                tierDetails: { orderBy: { tier: 'asc' } },
                payments: { orderBy: { paidAt: 'desc' } },
            },
        });
        return this.formatBillDetail(reloaded, reloaded.farmer);
    }
    formatBillDetail(bill, farmer) {
        return {
            id: bill.id,
            farmer: { id: farmer.id, code: farmer.code, name: farmer.name },
            scheme: { id: bill.scheme.id, name: bill.scheme.name, code: bill.scheme.code, basePrice: bill.scheme.basePrice },
            billingPeriod: `${bill.billingYear}年${bill.billingMonth}月`,
            billingYear: bill.billingYear,
            billingMonth: bill.billingMonth,
            quotaVolume: bill.quotaVolume,
            totalVolume: bill.totalVolume,
            tierBreakdown: bill.tierDetails.map((td) => ({
                tier: td.tier,
                rangeStart: td.rangeStart,
                rangeEnd: td.rangeEnd,
                unitPrice: td.unitPrice,
                volume: td.volume,
                amount: td.amount,
            })),
            tierSummary: {
                tier1: { volume: bill.tier1Volume, amount: bill.tier1Amount },
                tier2: { volume: bill.tier2Volume, amount: bill.tier2Amount },
                tier3: { volume: bill.tier3Volume, amount: bill.tier3Amount },
            },
            baseAmount: bill.baseAmount,
            subsidy: {
                amount: bill.subsidyAmount,
                volume: bill.subsidyVolume,
                description: bill.subsidyAmount > 0
                    ? `当月用水量低于定额80%，节约${bill.subsidyVolume.toFixed(2)}m³，按基准价50%返还补贴`
                    : '未达到节水补贴条件',
            },
            lateFee: bill.lateFeeAmount,
            totalAmount: bill.totalAmount,
            paidAmount: bill.paidAmount,
            remainingAmount: bill.remainingAmount,
            status: bill.status,
            statusName: enums_1.WaterBillStatus[bill.status] ? enums_1.WaterBillStatus[bill.status] : bill.status,
            dueDate: bill.dueDate,
            generatedAt: bill.generatedAt,
            payments: bill.payments.map((p) => ({
                id: p.id,
                amount: p.amount,
                method: p.method,
                paidAt: p.paidAt,
                remark: p.remark,
            })),
        };
    }
    async getChannelBillSummary(dto) {
        const { year, month, channelId } = dto;
        let channelIds = null;
        if (channelId) {
            const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
            if (!channel)
                throw new common_1.NotFoundException('渠道不存在');
            const allDescendants = await this.getAllChannelDescendants(channelId);
            channelIds = [channelId, ...allDescendants];
        }
        const farmerChannelMap = new Map();
        const farmers = await this.prisma.farmer.findMany({
            select: { id: true, channelId: true, channel: { select: { code: true, name: true, parentId: true } } },
        });
        for (const f of farmers) {
            farmerChannelMap.set(f.id, f.channelId);
        }
        const targetFarmerIds = channelIds
            ? farmers.filter((f) => channelIds.includes(f.channelId)).map((f) => f.id)
            : farmers.map((f) => f.id);
        const bills = await this.prisma.waterBill.findMany({
            where: {
                billingYear: year,
                billingMonth: month,
                farmerId: { in: targetFarmerIds },
            },
            include: { farmer: { include: { channel: true } } },
        });
        const channelBills = new Map();
        for (const bill of bills) {
            const chId = farmerChannelMap.get(bill.farmerId);
            if (!chId)
                continue;
            const farmer = bill.farmer;
            if (!channelBills.has(chId)) {
                channelBills.set(chId, {
                    channelId: chId,
                    channelCode: farmer.channel.code,
                    channelName: farmer.channel.name,
                    farmerCount: 0,
                    totalVolume: 0,
                    baseAmount: 0,
                    subsidyAmount: 0,
                    lateFeeAmount: 0,
                    totalAmount: 0,
                    paidAmount: 0,
                    remainingAmount: 0,
                    unpaidCount: 0,
                    overdueCount: 0,
                });
            }
            const entry = channelBills.get(chId);
            entry.farmerCount++;
            entry.totalVolume += bill.totalVolume;
            entry.baseAmount += bill.baseAmount;
            entry.subsidyAmount += bill.subsidyAmount;
            entry.lateFeeAmount += bill.lateFeeAmount;
            entry.totalAmount += bill.totalAmount;
            entry.paidAmount += bill.paidAmount;
            entry.remainingAmount += bill.remainingAmount;
            if (bill.status === enums_1.WaterBillStatus.UNPAID || bill.status === enums_1.WaterBillStatus.PARTIAL)
                entry.unpaidCount++;
            if (bill.status === enums_1.WaterBillStatus.OVERDUE)
                entry.overdueCount++;
        }
        const summaryList = Array.from(channelBills.values()).map((e) => ({
            ...e,
            totalVolume: +e.totalVolume.toFixed(4),
            baseAmount: +e.baseAmount.toFixed(2),
            subsidyAmount: +e.subsidyAmount.toFixed(2),
            lateFeeAmount: +e.lateFeeAmount.toFixed(2),
            totalAmount: +e.totalAmount.toFixed(2),
            paidAmount: +e.paidAmount.toFixed(2),
            remainingAmount: +e.remainingAmount.toFixed(2),
        }));
        const totalSummary = {
            farmerCount: bills.length,
            totalVolume: +bills.reduce((s, b) => s + b.totalVolume, 0).toFixed(4),
            baseAmount: +bills.reduce((s, b) => s + b.baseAmount, 0).toFixed(2),
            subsidyAmount: +bills.reduce((s, b) => s + b.subsidyAmount, 0).toFixed(2),
            lateFeeAmount: +bills.reduce((s, b) => s + b.lateFeeAmount, 0).toFixed(2),
            totalAmount: +bills.reduce((s, b) => s + b.totalAmount, 0).toFixed(2),
            paidAmount: +bills.reduce((s, b) => s + b.paidAmount, 0).toFixed(2),
            remainingAmount: +bills.reduce((s, b) => s + b.remainingAmount, 0).toFixed(2),
            unpaidCount: bills.filter((b) => b.status === enums_1.WaterBillStatus.UNPAID || b.status === enums_1.WaterBillStatus.PARTIAL).length,
            overdueCount: bills.filter((b) => b.status === enums_1.WaterBillStatus.OVERDUE).length,
            paidCount: bills.filter((b) => b.status === enums_1.WaterBillStatus.PAID).length,
        };
        return {
            year,
            month,
            totalSummary,
            channelBreakdown: summaryList.sort((a, b) => a.channelCode.localeCompare(b.channelCode)),
        };
    }
    async getAllChannelDescendants(channelId) {
        const result = [];
        const children = await this.prisma.channel.findMany({
            where: { parentId: channelId },
            select: { id: true },
        });
        for (const child of children) {
            result.push(child.id);
            const grandChildren = await this.getAllChannelDescendants(child.id);
            result.push(...grandChildren);
        }
        return result;
    }
    async payWaterBill(dto) {
        const bill = await this.prisma.waterBill.findUnique({ where: { id: dto.billId } });
        if (!bill)
            throw new common_1.NotFoundException('账单不存在');
        await this.updateSingleBillOverdue(bill);
        const currentBill = await this.prisma.waterBill.findUnique({ where: { id: dto.billId } });
        if (!currentBill)
            throw new common_1.NotFoundException('账单不存在');
        if (currentBill.status === enums_1.WaterBillStatus.PAID) {
            throw new common_1.BadRequestException('账单已缴清');
        }
        const method = dto.method ?? enums_1.PaymentMethod.FULL;
        let payAmount;
        if (method === enums_1.PaymentMethod.FULL) {
            payAmount = currentBill.remainingAmount;
        }
        else {
            if (!dto.amount || dto.amount <= 0) {
                throw new common_1.BadRequestException('部分缴费需要指定缴费金额');
            }
            if (dto.amount > currentBill.remainingAmount) {
                throw new common_1.BadRequestException(`缴费金额超过待缴金额${currentBill.remainingAmount.toFixed(2)}元`);
            }
            payAmount = dto.amount;
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const newPaidAmount = +(currentBill.paidAmount + payAmount).toFixed(2);
            const newRemainingAmount = +(currentBill.totalAmount - newPaidAmount).toFixed(2);
            const isFullyPaid = newRemainingAmount <= 0.01;
            const newStatus = isFullyPaid
                ? enums_1.WaterBillStatus.PAID
                : newPaidAmount > 0
                    ? enums_1.WaterBillStatus.PARTIAL
                    : currentBill.status;
            const updatedBill = await tx.waterBill.update({
                where: { id: dto.billId },
                data: {
                    paidAmount: newPaidAmount,
                    remainingAmount: Math.max(0, newRemainingAmount),
                    status: newStatus,
                    updatedAt: new Date(),
                },
                include: { farmer: true },
            });
            const payment = await tx.paymentRecord.create({
                data: {
                    billId: dto.billId,
                    farmerId: currentBill.farmerId,
                    amount: payAmount,
                    method,
                    remark: dto.remark,
                },
            });
            if (isFullyPaid) {
                await this.checkAndUpdateFreezeStatusInTx(tx, currentBill.farmerId);
            }
            return { updatedBill, payment };
        });
        const account = await this.checkAndUpdateFreezeStatus(currentBill.farmerId);
        return {
            billId: result.updatedBill.id,
            farmer: { id: result.updatedBill.farmerId, name: result.updatedBill.farmer.name },
            billingPeriod: `${result.updatedBill.billingYear}年${result.updatedBill.billingMonth}月`,
            payAmount,
            paymentMethod: method,
            paidAmount: result.updatedBill.paidAmount,
            remainingAmount: result.updatedBill.remainingAmount,
            status: result.updatedBill.status,
            isFullyPaid: result.updatedBill.status === enums_1.WaterBillStatus.PAID,
            paymentId: result.payment.id,
            accountStatus: account ? { isFrozen: account.isFrozen, freezeReason: account.freezeReason } : null,
        };
    }
    async getFarmerPaymentHistory(dto) {
        const farmer = await this.prisma.farmer.findUnique({ where: { id: dto.farmerId } });
        if (!farmer)
            throw new common_1.NotFoundException('用水户不存在');
        const payments = await this.prisma.paymentRecord.findMany({
            where: { farmerId: dto.farmerId },
            include: {
                bill: {
                    select: {
                        id: true,
                        billingYear: true,
                        billingMonth: true,
                        totalAmount: true,
                        status: true,
                    },
                },
            },
            orderBy: { paidAt: 'desc' },
        });
        return {
            farmer: { id: farmer.id, code: farmer.code, name: farmer.name },
            totalPaymentCount: payments.length,
            totalPaymentAmount: +payments.reduce((s, p) => s + p.amount, 0).toFixed(2),
            payments: payments.map((p) => ({
                id: p.id,
                billId: p.billId,
                billingPeriod: `${p.bill.billingYear}年${p.bill.billingMonth}月`,
                billTotalAmount: p.bill.totalAmount,
                billStatus: p.bill.status,
                amount: p.amount,
                method: p.method,
                paidAt: p.paidAt,
                remark: p.remark,
            })),
        };
    }
    async getFarmerDebtStatus(farmerId) {
        const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId } });
        if (!farmer)
            throw new common_1.NotFoundException('用水户不存在');
        await this.updateBillOverdueStatus(farmerId);
        const account = await this.ensureFarmerAccount(farmerId);
        const unpaidBills = await this.prisma.waterBill.findMany({
            where: {
                farmerId,
                status: { in: [enums_1.WaterBillStatus.UNPAID, enums_1.WaterBillStatus.PARTIAL, enums_1.WaterBillStatus.OVERDUE] },
            },
            orderBy: [{ billingYear: 'asc' }, { billingMonth: 'asc' }],
        });
        const totalRemaining = unpaidBills.reduce((s, b) => s + b.remainingAmount, 0);
        const totalLateFee = unpaidBills.reduce((s, b) => s + b.lateFeeAmount, 0);
        const overdueBills = unpaidBills.filter((b) => b.status === enums_1.WaterBillStatus.OVERDUE);
        let overdueMonths = 0;
        if (overdueBills.length > 0) {
            const now = (0, dayjs_1.default)();
            const minBillDate = (0, dayjs_1.default)(`${overdueBills[0].billingYear}-${String(overdueBills[0].billingMonth).padStart(2, '0')}-01`);
            overdueMonths = Math.max(0, now.diff(minBillDate, 'month'));
            if (overdueMonths === 0 && overdueBills.length >= 2) {
                overdueMonths = overdueBills.length;
            }
        }
        await this.prisma.farmerAccount.update({
            where: { id: account.id },
            data: { lastOverdueMonths: overdueMonths },
        });
        return {
            farmer: { id: farmer.id, code: farmer.code, name: farmer.name },
            account: {
                isFrozen: account.isFrozen,
                freezeReason: account.freezeReason,
                frozenAt: account.frozenAt,
                overdueMonths,
            },
            debtSummary: {
                unpaidBillCount: unpaidBills.length,
                overdueBillCount: overdueBills.length,
                totalRemainingAmount: +totalRemaining.toFixed(2),
                totalLateFeeAmount: +totalLateFee.toFixed(2),
            },
            unpaidBills: unpaidBills.map((b) => ({
                id: b.id,
                billingPeriod: `${b.billingYear}年${b.billingMonth}月`,
                totalAmount: b.totalAmount,
                paidAmount: b.paidAmount,
                remainingAmount: b.remainingAmount,
                lateFee: b.lateFeeAmount,
                status: b.status,
                dueDate: b.dueDate,
            })),
        };
    }
    async checkFarmerCanApply(farmerId) {
        const account = await this.prisma.farmerAccount.findUnique({ where: { farmerId } });
        if (account && account.isFrozen) {
            return {
                canApply: false,
                reason: account.freezeReason || '账户已被冻结',
            };
        }
        const status = await this.getFarmerDebtStatus(farmerId);
        if (status.account.isFrozen) {
            return {
                canApply: false,
                reason: status.account.freezeReason || '存在累计超过2个月的欠费，新申请已被冻结',
            };
        }
        return { canApply: true };
    }
    async updateSingleBillOverdue(bill) {
        if (bill.status === enums_1.WaterBillStatus.PAID)
            return;
        const now = (0, dayjs_1.default)();
        const dueDate = (0, dayjs_1.default)(bill.dueDate);
        if (!now.isAfter(dueDate))
            return;
        const daysOverdue = now.diff(dueDate, 'day');
        if (daysOverdue <= 0)
            return;
        const lastCalc = bill.lastLateFeeCalc ? (0, dayjs_1.default)(bill.lastLateFeeCalc) : dueDate;
        const daysToCalc = now.diff(lastCalc, 'day');
        if (daysToCalc > 0 && bill.remainingAmount > 0) {
            const newLateFee = +(bill.remainingAmount * LATE_FEE_RATE * daysToCalc).toFixed(2);
            const newTotalLateFee = +(bill.lateFeeAmount + newLateFee).toFixed(2);
            const newTotalAmount = +(bill.totalAmount + newLateFee).toFixed(2);
            const newRemaining = +(bill.remainingAmount + newLateFee).toFixed(2);
            await this.prisma.waterBill.update({
                where: { id: bill.id },
                data: {
                    lateFeeAmount: newTotalLateFee,
                    totalAmount: newTotalAmount,
                    remainingAmount: newRemaining,
                    status: enums_1.WaterBillStatus.OVERDUE,
                    lastLateFeeCalc: now.toDate(),
                    updatedAt: now.toDate(),
                },
            });
        }
        else if (bill.status !== enums_1.WaterBillStatus.OVERDUE) {
            await this.prisma.waterBill.update({
                where: { id: bill.id },
                data: {
                    status: enums_1.WaterBillStatus.OVERDUE,
                    lastLateFeeCalc: now.toDate(),
                    updatedAt: now.toDate(),
                },
            });
        }
    }
    async updateBillOverdueStatus(farmerId) {
        const bills = await this.prisma.waterBill.findMany({
            where: {
                farmerId,
                status: { in: [enums_1.WaterBillStatus.UNPAID, enums_1.WaterBillStatus.PARTIAL, enums_1.WaterBillStatus.OVERDUE] },
            },
        });
        for (const bill of bills) {
            await this.updateSingleBillOverdue(bill);
        }
        await this.checkAndUpdateFreezeStatus(farmerId);
    }
    async checkAndUpdateFreezeStatus(farmerId) {
        const account = await this.ensureFarmerAccount(farmerId);
        const overdueBills = await this.prisma.waterBill.findMany({
            where: { farmerId, status: enums_1.WaterBillStatus.OVERDUE },
            orderBy: [{ billingYear: 'asc' }, { billingMonth: 'asc' }],
        });
        let overdueMonths = 0;
        if (overdueBills.length > 0) {
            const now = (0, dayjs_1.default)();
            const firstOverdue = overdueBills[0];
            const firstBillDate = (0, dayjs_1.default)(`${firstOverdue.billingYear}-${String(firstOverdue.billingMonth).padStart(2, '0')}-01`);
            overdueMonths = Math.max(overdueBills.length, now.diff(firstBillDate, 'month'));
        }
        const allPaid = overdueBills.length === 0;
        if (overdueMonths >= FREEZE_OVERDUE_MONTHS && !account.isFrozen) {
            return this.prisma.farmerAccount.update({
                where: { id: account.id },
                data: {
                    isFrozen: true,
                    freezeReason: `累计欠费超过${FREEZE_OVERDUE_MONTHS}个月，请及时缴清欠费后自动解冻`,
                    frozenAt: new Date(),
                    lastOverdueMonths: overdueMonths,
                    updatedAt: new Date(),
                },
            });
        }
        if (allPaid && account.isFrozen) {
            return this.prisma.farmerAccount.update({
                where: { id: account.id },
                data: {
                    isFrozen: false,
                    freezeReason: null,
                    frozenAt: null,
                    lastOverdueMonths: 0,
                    updatedAt: new Date(),
                },
            });
        }
        return this.prisma.farmerAccount.update({
            where: { id: account.id },
            data: {
                lastOverdueMonths: overdueMonths,
                updatedAt: new Date(),
            },
        });
    }
    async checkAndUpdateFreezeStatusInTx(tx, farmerId) {
        const account = await tx.farmerAccount.findUnique({ where: { farmerId } });
        if (!account)
            return;
        const overdueBills = await tx.waterBill.findMany({
            where: { farmerId, status: enums_1.WaterBillStatus.OVERDUE },
        });
        if (overdueBills.length === 0 && account.isFrozen) {
            await tx.farmerAccount.update({
                where: { id: account.id },
                data: {
                    isFrozen: false,
                    freezeReason: null,
                    frozenAt: null,
                    lastOverdueMonths: 0,
                    updatedAt: new Date(),
                },
            });
        }
    }
    async handleMonthlyBillingCron() {
        const lastMonth = (0, dayjs_1.default)().subtract(1, 'month');
        const year = lastMonth.year();
        const month = lastMonth.month() + 1;
        try {
            const result = await this.generateMonthlyBills({ year, month });
            console.log(`[Cron] 自动生成${year}年${month}月账单完成: 成功${result.successCount}条, 跳过${result.skipCount}条`);
        }
        catch (e) {
            console.error(`[Cron] 自动生成${year}年${month}月账单失败:`, e);
        }
    }
    async handleOverdueCheckCron() {
        try {
            const allAccounts = await this.prisma.farmerAccount.findMany();
            for (const account of allAccounts) {
                await this.updateBillOverdueStatus(account.farmerId);
            }
            console.log(`[Cron] 欠费检查完成, 共处理${allAccounts.length}个账户`);
        }
        catch (e) {
            console.error('[Cron] 欠费检查失败:', e);
        }
    }
};
exports.WaterBillingService = WaterBillingService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, { name: 'generate_monthly_bills' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WaterBillingService.prototype, "handleMonthlyBillingCron", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM, { name: 'check_overdue_bills' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WaterBillingService.prototype, "handleOverdueCheckCron", null);
exports.WaterBillingService = WaterBillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WaterBillingService);
//# sourceMappingURL=water-billing.service.js.map