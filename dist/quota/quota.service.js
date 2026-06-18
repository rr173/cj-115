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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const enums_1 = require("../common/enums");
let QuotaService = class QuotaService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async setQuota(dto) {
        const farmer = await this.prisma.farmer.findUnique({ where: { id: dto.farmerId } });
        if (!farmer)
            throw new common_1.NotFoundException('用水户不存在');
        const existingQuota = await this.prisma.quota.findUnique({
            where: { farmerId_year_quarter: { farmerId: dto.farmerId, year: dto.year, quarter: dto.quarter } },
        });
        const newTotal = farmer.area * dto.amount;
        const cancelledApps = [];
        if (existingQuota && dto.amount < existingQuota.amount) {
            const oldTotal = farmer.area * existingQuota.amount;
            if (newTotal < oldTotal) {
                const pendingApps = await this.prisma.waterApplication.findMany({
                    where: {
                        farmerId: dto.farmerId,
                        status: { in: [enums_1.ApplicationStatus.PENDING, enums_1.ApplicationStatus.SCHEDULED] },
                    },
                    orderBy: { submitTime: 'desc' },
                });
                const currentAppliedSum = pendingApps.reduce((sum, a) => sum + a.requestVolume, 0);
                if (currentAppliedSum > newTotal) {
                    let exceeded = currentAppliedSum - newTotal;
                    for (const app of pendingApps) {
                        if (exceeded <= 0)
                            break;
                        await this.prisma.$transaction(async (tx) => {
                            await tx.waterAllocation.deleteMany({ where: { applicationId: app.id } });
                            await tx.waterApplication.update({
                                where: { id: app.id },
                                data: {
                                    status: enums_1.ApplicationStatus.CANCELLED_QUOTA,
                                    failReason: '因定额调整取消',
                                },
                            });
                        });
                        cancelledApps.push({ id: app.id, requestVolume: app.requestVolume });
                        exceeded -= app.requestVolume;
                    }
                }
            }
        }
        const quota = await this.prisma.quota.upsert({
            where: { farmerId_year_quarter: { farmerId: dto.farmerId, year: dto.year, quarter: dto.quarter } },
            update: { amount: dto.amount },
            create: { ...dto },
        });
        return { quota, totalAvailable: newTotal, cancelledApplications: cancelledApps };
    }
    async findAll(year, quarter) {
        const where = {};
        if (year)
            where.year = year;
        if (quarter)
            where.quarter = quarter;
        return this.prisma.quota.findMany({
            where,
            include: { farmer: { select: { id: true, code: true, name: true, area: true } } },
            orderBy: [{ year: 'desc' }, { quarter: 'asc' }],
        });
    }
    async getFarmerQuotaStatus(farmerId, year, quarter) {
        const farmer = await this.prisma.farmer.findUnique({
            where: { id: farmerId },
            include: {
                quotas: { where: { year, quarter: quarter } },
                applications: {
                    where: {
                        status: { in: [enums_1.ApplicationStatus.PENDING, enums_1.ApplicationStatus.SCHEDULED, enums_1.ApplicationStatus.EXECUTED] },
                    },
                },
            },
        });
        if (!farmer)
            throw new common_1.NotFoundException('用水户不存在');
        const quota = farmer.quotas[0];
        if (!quota)
            throw new common_1.BadRequestException('该季度定额尚未设置');
        const totalAvailable = farmer.area * quota.amount;
        const usedAmount = farmer.applications.reduce((sum, a) => sum + a.requestVolume, 0);
        const remaining = Math.max(0, totalAvailable - usedAmount);
        return {
            farmer: { id: farmer.id, code: farmer.code, name: farmer.name, area: farmer.area },
            quota: { amount: quota.amount, quarter, year },
            totalAvailable,
            appliedAmount: usedAmount,
            remainingAmount: remaining,
        };
    }
    async getFarmerAppliedAmount(farmerId, excludeAppId) {
        const where = {
            farmerId,
            status: { in: [enums_1.ApplicationStatus.PENDING, enums_1.ApplicationStatus.SCHEDULED, enums_1.ApplicationStatus.EXECUTED] },
        };
        if (excludeAppId)
            where.id = { not: excludeAppId };
        const apps = await this.prisma.waterApplication.findMany({ where });
        return apps.reduce((sum, a) => sum + a.requestVolume, 0);
    }
    async getFarmerQuota(farmerId, year, quarter) {
        const q = await this.prisma.quota.findUnique({
            where: { farmerId_year_quarter: { farmerId, year, quarter: quarter } },
        });
        return q;
    }
};
exports.QuotaService = QuotaService;
exports.QuotaService = QuotaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuotaService);
//# sourceMappingURL=quota.service.js.map