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
exports.DisputeMediationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const credit_rating_service_1 = require("../credit-rating/credit-rating.service");
const schedule_1 = require("@nestjs/schedule");
const dayjs_1 = __importDefault(require("dayjs"));
const enums_1 = require("../common/enums");
const DISPUTE_CREDIT_PENALTY_SCORE = -3;
const DISPUTE_CREDIT_THRESHOLD = 3;
const AUTO_ARCHIVE_DAYS = 30;
const QUARTER_NAME_MAP = {
    [enums_1.QuotaQuarter.Q1]: '第一季度',
    [enums_1.QuotaQuarter.Q2]: '第二季度',
    [enums_1.QuotaQuarter.Q3]: '第三季度',
    [enums_1.QuotaQuarter.Q4]: '第四季度',
};
function monthToQuarter(month) {
    if (month <= 3)
        return enums_1.QuotaQuarter.Q1;
    if (month <= 6)
        return enums_1.QuotaQuarter.Q2;
    if (month <= 9)
        return enums_1.QuotaQuarter.Q3;
    return enums_1.QuotaQuarter.Q4;
}
function quarterToMonths(quarter) {
    switch (quarter) {
        case enums_1.QuotaQuarter.Q1: return [1, 2, 3];
        case enums_1.QuotaQuarter.Q2: return [4, 5, 6];
        case enums_1.QuotaQuarter.Q3: return [7, 8, 9];
        case enums_1.QuotaQuarter.Q4: return [10, 11, 12];
        default: return [];
    }
}
let DisputeMediationService = class DisputeMediationService {
    constructor(prisma, creditRatingService) {
        this.prisma = prisma;
        this.creditRatingService = creditRatingService;
    }
    async generateDisputeNo() {
        const now = (0, dayjs_1.default)();
        const yearMonth = now.format('YYYYMM');
        const prefix = `JF-${yearMonth}-`;
        const lastDispute = await this.prisma.disputeCase.findFirst({
            where: { disputeNo: { startsWith: prefix } },
            orderBy: { disputeNo: 'desc' },
            select: { disputeNo: true },
        });
        let seq = 1;
        if (lastDispute) {
            const lastSeq = parseInt(lastDispute.disputeNo.split('-')[2], 10);
            seq = lastSeq + 1;
        }
        return `${prefix}${String(seq).padStart(3, '0')}`;
    }
    async createDispute(dto) {
        if (!Object.values(enums_1.DisputeType).includes(dto.type)) {
            throw new common_1.BadRequestException(`无效的纠纷类型: ${dto.type}`);
        }
        const farmers = await this.prisma.farmer.findMany({
            where: { id: { in: dto.farmerIds } },
            select: { id: true },
        });
        if (farmers.length !== dto.farmerIds.length) {
            throw new common_1.BadRequestException('部分用水户ID不存在');
        }
        if (dto.applicationIds && dto.applicationIds.length > 0) {
            const apps = await this.prisma.waterApplication.findMany({
                where: { id: { in: dto.applicationIds } },
                select: { id: true },
            });
            if (apps.length !== dto.applicationIds.length) {
                throw new common_1.BadRequestException('部分配水申请ID不存在');
            }
        }
        const disputeNo = await this.generateDisputeNo();
        const dispute = await this.prisma.$transaction(async (tx) => {
            const disputeCase = await tx.disputeCase.create({
                data: {
                    disputeNo,
                    type: dto.type,
                    description: dto.description,
                    occurredAt: (0, dayjs_1.default)(dto.occurredAt).toDate(),
                    status: enums_1.DisputeStatus.PENDING_ACCEPT,
                },
            });
            await tx.disputeFarmerLink.createMany({
                data: dto.farmerIds.map((farmerId) => ({
                    disputeId: disputeCase.id,
                    farmerId,
                })),
            });
            if (dto.applicationIds && dto.applicationIds.length > 0) {
                await tx.disputeApplicationLink.createMany({
                    data: dto.applicationIds.map((applicationId) => ({
                        disputeId: disputeCase.id,
                        applicationId,
                    })),
                });
            }
            return disputeCase;
        });
        await this.checkAndApplyCreditPenalty(dto.farmerIds);
        return {
            id: dispute.id,
            disputeNo: dispute.disputeNo,
            type: dispute.type,
            typeName: enums_1.DisputeTypeNames[dispute.type],
            description: dispute.description,
            occurredAt: dispute.occurredAt,
            status: dispute.status,
            statusName: enums_1.DisputeStatusNames[dispute.status],
            farmerIds: dto.farmerIds,
            applicationIds: dto.applicationIds || [],
            createdAt: dispute.createdAt,
        };
    }
    async acceptDispute(id, dto) {
        const dispute = await this.prisma.disputeCase.findUnique({ where: { id } });
        if (!dispute)
            throw new common_1.NotFoundException('纠纷记录不存在');
        if (dispute.status !== enums_1.DisputeStatus.PENDING_ACCEPT) {
            throw new common_1.BadRequestException('只有待受理状态的纠纷可以受理');
        }
        const updated = await this.prisma.disputeCase.update({
            where: { id },
            data: {
                status: enums_1.DisputeStatus.MEDIATING,
                mediatorName: dto.mediatorName,
                expectedDays: dto.expectedDays,
                acceptedAt: new Date(),
                updatedAt: new Date(),
            },
        });
        return {
            id: updated.id,
            disputeNo: updated.disputeNo,
            status: updated.status,
            statusName: enums_1.DisputeStatusNames[updated.status],
            mediatorName: updated.mediatorName,
            expectedDays: updated.expectedDays,
            acceptedAt: updated.acceptedAt,
        };
    }
    async addMediationRecord(id, dto) {
        const dispute = await this.prisma.disputeCase.findUnique({ where: { id } });
        if (!dispute)
            throw new common_1.NotFoundException('纠纷记录不存在');
        if (dispute.status !== enums_1.DisputeStatus.MEDIATING) {
            throw new common_1.BadRequestException('只有调解中状态的纠纷可以追加调解记录');
        }
        const record = await this.prisma.disputeMediationRecord.create({
            data: {
                disputeId: id,
                recordedAt: new Date(),
                recorderName: dto.recorderName,
                content: dto.content,
                isOnSiteInspection: dto.isOnSiteInspection ?? false,
            },
        });
        return {
            id: record.id,
            disputeId: record.disputeId,
            recordedAt: record.recordedAt,
            recorderName: record.recorderName,
            content: record.content,
            isOnSiteInspection: record.isOnSiteInspection,
            createdAt: record.createdAt,
        };
    }
    async closeDispute(id, dto) {
        const dispute = await this.prisma.disputeCase.findUnique({ where: { id } });
        if (!dispute)
            throw new common_1.NotFoundException('纠纷记录不存在');
        if (dispute.status !== enums_1.DisputeStatus.MEDIATING) {
            throw new common_1.BadRequestException('只有调解中状态的纠纷可以结案');
        }
        if (!Object.values(enums_1.MediationResult).includes(dto.result)) {
            throw new common_1.BadRequestException(`无效的处理结论: ${dto.result}`);
        }
        const updated = await this.prisma.disputeCase.update({
            where: { id },
            data: {
                status: enums_1.DisputeStatus.CLOSED,
                result: dto.result,
                resultNote: dto.resultNote,
                closedAt: new Date(),
                updatedAt: new Date(),
            },
        });
        return {
            id: updated.id,
            disputeNo: updated.disputeNo,
            status: updated.status,
            statusName: enums_1.DisputeStatusNames[updated.status],
            result: updated.result,
            resultName: enums_1.MediationResultNames[updated.result],
            resultNote: updated.resultNote,
            closedAt: updated.closedAt,
        };
    }
    async reopenDispute(id) {
        const dispute = await this.prisma.disputeCase.findUnique({ where: { id } });
        if (!dispute)
            throw new common_1.NotFoundException('纠纷记录不存在');
        if (dispute.status !== enums_1.DisputeStatus.CLOSED) {
            throw new common_1.BadRequestException('只有已结案状态的纠纷可以重新打开');
        }
        if (dispute.closedAt) {
            const daysSinceClose = (0, dayjs_1.default)().diff((0, dayjs_1.default)(dispute.closedAt), 'day');
            if (daysSinceClose >= AUTO_ARCHIVE_DAYS) {
                throw new common_1.BadRequestException(`结案已超过${AUTO_ARCHIVE_DAYS}天,无法重新打开`);
            }
        }
        const updated = await this.prisma.disputeCase.update({
            where: { id },
            data: {
                status: enums_1.DisputeStatus.MEDIATING,
                result: null,
                resultNote: null,
                closedAt: null,
                updatedAt: new Date(),
            },
        });
        return {
            id: updated.id,
            disputeNo: updated.disputeNo,
            status: updated.status,
            statusName: enums_1.DisputeStatusNames[updated.status],
        };
    }
    async archiveDispute(id) {
        const dispute = await this.prisma.disputeCase.findUnique({ where: { id } });
        if (!dispute)
            throw new common_1.NotFoundException('纠纷记录不存在');
        if (dispute.status !== enums_1.DisputeStatus.CLOSED) {
            throw new common_1.BadRequestException('只有已结案状态的纠纷可以归档');
        }
        const updated = await this.prisma.disputeCase.update({
            where: { id },
            data: {
                status: enums_1.DisputeStatus.ARCHIVED,
                archivedAt: new Date(),
                updatedAt: new Date(),
            },
        });
        return {
            id: updated.id,
            disputeNo: updated.disputeNo,
            status: updated.status,
            statusName: enums_1.DisputeStatusNames[updated.status],
            archivedAt: updated.archivedAt,
        };
    }
    isOverdue(dispute) {
        if (dispute.status !== enums_1.DisputeStatus.MEDIATING)
            return false;
        if (!dispute.acceptedAt || !dispute.expectedDays)
            return false;
        const deadline = (0, dayjs_1.default)(dispute.acceptedAt).add(dispute.expectedDays, 'day');
        return (0, dayjs_1.default)().isAfter(deadline);
    }
    async queryDisputes(dto) {
        const page = dto.page || 1;
        const pageSize = dto.pageSize || 20;
        const skip = (page - 1) * pageSize;
        const where = {};
        if (dto.startDate || dto.endDate) {
            where.occurredAt = {};
            if (dto.startDate)
                where.occurredAt.gte = (0, dayjs_1.default)(dto.startDate).startOf('day').toDate();
            if (dto.endDate)
                where.occurredAt.lte = (0, dayjs_1.default)(dto.endDate).endOf('day').toDate();
        }
        if (dto.type)
            where.type = dto.type;
        if (dto.status)
            where.status = dto.status;
        if (dto.isOverdue === true) {
            where.status = enums_1.DisputeStatus.MEDIATING;
            where.acceptedAt = { not: null };
            where.expectedDays = { not: null };
        }
        const [disputes, total] = await Promise.all([
            this.prisma.disputeCase.findMany({
                where,
                include: {
                    farmerLinks: { include: { farmer: { select: { id: true, code: true, name: true } } } },
                    applicationLinks: { include: { application: { select: { id: true, status: true, targetDate: true } } } },
                    mediationRecords: { orderBy: { recordedAt: 'asc' } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            this.prisma.disputeCase.count({ where }),
        ]);
        const items = disputes.map((d) => ({
            id: d.id,
            disputeNo: d.disputeNo,
            type: d.type,
            typeName: enums_1.DisputeTypeNames[d.type],
            description: d.description,
            occurredAt: d.occurredAt,
            status: d.status,
            statusName: enums_1.DisputeStatusNames[d.status],
            isOverdue: this.isOverdue(d),
            mediatorName: d.mediatorName,
            expectedDays: d.expectedDays,
            acceptedAt: d.acceptedAt,
            closedAt: d.closedAt,
            result: d.result,
            resultName: d.result ? enums_1.MediationResultNames[d.result] : null,
            resultNote: d.resultNote,
            farmers: d.farmerLinks.map((fl) => fl.farmer),
            applications: d.applicationLinks.map((al) => al.application),
            mediationRecordCount: d.mediationRecords.length,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
        }));
        return { total, page, pageSize, items };
    }
    async getDisputeDetail(id) {
        const dispute = await this.prisma.disputeCase.findUnique({
            where: { id },
            include: {
                farmerLinks: { include: { farmer: { select: { id: true, code: true, name: true, channelId: true } } } },
                applicationLinks: {
                    include: {
                        application: {
                            select: {
                                id: true,
                                status: true,
                                targetDate: true,
                                requestVolume: true,
                                expectedFlow: true,
                                expectedHours: true,
                                farmerId: true,
                                createdAt: true,
                            },
                        },
                    },
                },
                mediationRecords: { orderBy: { recordedAt: 'asc' } },
            },
        });
        if (!dispute)
            throw new common_1.NotFoundException('纠纷记录不存在');
        return {
            id: dispute.id,
            disputeNo: dispute.disputeNo,
            type: dispute.type,
            typeName: enums_1.DisputeTypeNames[dispute.type],
            description: dispute.description,
            occurredAt: dispute.occurredAt,
            status: dispute.status,
            statusName: enums_1.DisputeStatusNames[dispute.status],
            isOverdue: this.isOverdue(dispute),
            mediatorName: dispute.mediatorName,
            expectedDays: dispute.expectedDays,
            acceptedAt: dispute.acceptedAt,
            closedAt: dispute.closedAt,
            archivedAt: dispute.archivedAt,
            result: dispute.result,
            resultName: dispute.result ? enums_1.MediationResultNames[dispute.result] : null,
            resultNote: dispute.resultNote,
            farmers: dispute.farmerLinks.map((fl) => fl.farmer),
            applications: dispute.applicationLinks.map((al) => al.application),
            mediationTimeline: dispute.mediationRecords.map((r) => ({
                id: r.id,
                recordedAt: r.recordedAt,
                recorderName: r.recorderName,
                content: r.content,
                isOnSiteInspection: r.isOnSiteInspection,
            })),
            createdAt: dispute.createdAt,
            updatedAt: dispute.updatedAt,
        };
    }
    async getFarmerDisputes(farmerId) {
        const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId } });
        if (!farmer)
            throw new common_1.NotFoundException('用水户不存在');
        const links = await this.prisma.disputeFarmerLink.findMany({
            where: { farmerId },
            include: {
                dispute: {
                    include: {
                        farmerLinks: { include: { farmer: { select: { id: true, code: true, name: true } } } },
                        mediationRecords: { orderBy: { recordedAt: 'asc' } },
                    },
                },
            },
            orderBy: { dispute: { createdAt: 'desc' } },
        });
        return {
            farmer: { id: farmer.id, code: farmer.code, name: farmer.name },
            total: links.length,
            disputes: links.map((link) => {
                const d = link.dispute;
                return {
                    id: d.id,
                    disputeNo: d.disputeNo,
                    type: d.type,
                    typeName: enums_1.DisputeTypeNames[d.type],
                    description: d.description,
                    occurredAt: d.occurredAt,
                    status: d.status,
                    statusName: enums_1.DisputeStatusNames[d.status],
                    isOverdue: this.isOverdue(d),
                    result: d.result,
                    resultName: d.result ? enums_1.MediationResultNames[d.result] : null,
                    otherFarmers: d.farmerLinks
                        .filter((fl) => fl.farmerId !== farmerId)
                        .map((fl) => fl.farmer),
                    mediationRecordCount: d.mediationRecords.length,
                    createdAt: d.createdAt,
                };
            }),
        };
    }
    async getQuarterlyStats(dto) {
        const { year, quarter } = dto;
        const months = quarterToMonths(quarter);
        if (months.length === 0) {
            throw new common_1.BadRequestException('无效的季度,请使用Q1/Q2/Q3/Q4');
        }
        const quarterStart = (0, dayjs_1.default)(`${year}-${String(months[0]).padStart(2, '0')}-01`).startOf('day');
        const quarterEnd = quarterStart.add(3, 'month');
        const disputes = await this.prisma.disputeCase.findMany({
            where: {
                occurredAt: {
                    gte: quarterStart.toDate(),
                    lt: quarterEnd.toDate(),
                },
            },
            select: {
                type: true,
                status: true,
                acceptedAt: true,
                closedAt: true,
                expectedDays: true,
            },
        });
        const typeCountMap = {};
        const typeDaysMap = {};
        for (const d of disputes) {
            const t = d.type;
            typeCountMap[t] = (typeCountMap[t] || 0) + 1;
            if (d.acceptedAt && d.closedAt) {
                const processingDays = (0, dayjs_1.default)(d.closedAt).diff((0, dayjs_1.default)(d.acceptedAt), 'day');
                if (!typeDaysMap[t])
                    typeDaysMap[t] = [];
                typeDaysMap[t].push(processingDays);
            }
        }
        const typeStats = Object.values(enums_1.DisputeType).map((t) => {
            const count = typeCountMap[t] || 0;
            const daysList = typeDaysMap[t] || [];
            const avgDays = daysList.length > 0
                ? Math.round(daysList.reduce((a, b) => a + b, 0) / daysList.length * 10) / 10
                : null;
            return {
                type: t,
                typeName: enums_1.DisputeTypeNames[t],
                count,
                avgProcessingDays: avgDays,
            };
        });
        const allDays = Object.values(typeDaysMap).flat();
        const totalAvgDays = allDays.length > 0
            ? Math.round(allDays.reduce((a, b) => a + b, 0) / allDays.length * 10) / 10
            : null;
        const creditPenaltyResults = await this.applyQuarterlyCreditPenalty(year, quarter);
        return {
            year,
            quarter,
            quarterName: QUARTER_NAME_MAP[quarter] || `第${quarter}季度`,
            totalDisputes: disputes.length,
            totalAvgProcessingDays: totalAvgDays,
            typeStats,
            creditPenalty: creditPenaltyResults,
        };
    }
    async hasQuarterlyDisputePenalty(farmerId, year, quarter) {
        const reasonPrefix = `${year}年${quarter}季度涉及`;
        const reasonSuffix = `条纠纷,信用分扣${Math.abs(DISPUTE_CREDIT_PENALTY_SCORE)}分`;
        const count = await this.prisma.creditScoreHistory.count({
            where: {
                farmerId,
                operator: 'dispute-mediation-system',
                reason: {
                    startsWith: reasonPrefix,
                    contains: reasonSuffix,
                },
                createdAt: {
                    gte: (0, dayjs_1.default)(`${year}-01-01`).startOf('day').toDate(),
                    lt: (0, dayjs_1.default)(`${year + 1}-01-01`).startOf('day').toDate(),
                },
            },
        });
        return count > 0;
    }
    async applyPenaltyForFarmerInQuarter(farmerId, year, quarter) {
        const months = quarterToMonths(quarter);
        const quarterStart = (0, dayjs_1.default)(`${year}-${String(months[0]).padStart(2, '0')}-01`).startOf('day');
        const quarterEnd = quarterStart.add(3, 'month');
        const disputeCount = await this.prisma.disputeFarmerLink.count({
            where: {
                farmerId,
                dispute: {
                    occurredAt: {
                        gte: quarterStart.toDate(),
                        lt: quarterEnd.toDate(),
                    },
                },
            },
        });
        if (disputeCount < DISPUTE_CREDIT_THRESHOLD) {
            return {
                farmerId,
                disputeCount,
                penalized: false,
                reason: `当季纠纷${disputeCount}条,未达扣分阈值${DISPUTE_CREDIT_THRESHOLD}条`,
            };
        }
        const alreadyPenalized = await this.hasQuarterlyDisputePenalty(farmerId, year, quarter);
        if (alreadyPenalized) {
            return {
                farmerId,
                disputeCount,
                penalized: false,
                reason: `${year}年${quarter}季度已因纠纷扣过信用分,不再重复扣分`,
            };
        }
        try {
            await this.creditRatingService.adjustCreditScore(farmerId, {
                adjustScore: DISPUTE_CREDIT_PENALTY_SCORE,
                reason: `${year}年${quarter}季度涉及${disputeCount}条纠纷,信用分扣${Math.abs(DISPUTE_CREDIT_PENALTY_SCORE)}分`,
                operator: 'dispute-mediation-system',
            });
            return {
                farmerId,
                disputeCount,
                penalized: true,
                reason: `当季纠纷${disputeCount}条,达到阈值,已扣信用分${Math.abs(DISPUTE_CREDIT_PENALTY_SCORE)}分`,
            };
        }
        catch (e) {
            console.error(`[纠纷信用扣分] 用水户${farmerId}信用扣分失败:`, e.message);
            return {
                farmerId,
                disputeCount,
                penalized: false,
                reason: `扣分失败: ${e.message}`,
            };
        }
    }
    async applyQuarterlyCreditPenalty(year, quarter) {
        const months = quarterToMonths(quarter);
        const quarterStart = (0, dayjs_1.default)(`${year}-${String(months[0]).padStart(2, '0')}-01`).startOf('day');
        const quarterEnd = quarterStart.add(3, 'month');
        const farmerLinks = await this.prisma.disputeFarmerLink.findMany({
            where: {
                dispute: {
                    occurredAt: {
                        gte: quarterStart.toDate(),
                        lt: quarterEnd.toDate(),
                    },
                },
            },
            select: { farmerId: true },
            distinct: ['farmerId'],
        });
        const results = [];
        for (const { farmerId } of farmerLinks) {
            const result = await this.applyPenaltyForFarmerInQuarter(farmerId, year, quarter);
            results.push(result);
        }
        const penalizedCount = results.filter((r) => r.penalized).length;
        return {
            totalChecked: farmerLinks.length,
            penalizedCount,
            details: results,
        };
    }
    async checkAndApplyCreditPenalty(farmerIds) {
        const now = (0, dayjs_1.default)();
        const currentMonth = now.month() + 1;
        const currentYear = now.year();
        const quarter = monthToQuarter(currentMonth);
        for (const farmerId of farmerIds) {
            await this.applyPenaltyForFarmerInQuarter(farmerId, currentYear, quarter);
        }
    }
    async triggerQuarterlyCreditPenalty(year, quarter) {
        const months = quarterToMonths(quarter);
        if (months.length === 0) {
            throw new common_1.BadRequestException('无效的季度,请使用Q1/Q2/Q3/Q4');
        }
        return this.applyQuarterlyCreditPenalty(year, quarter);
    }
    async triggerAllQuarterlyCreditPenalty() {
        const now = (0, dayjs_1.default)();
        const currentYear = now.year();
        const allResults = [];
        for (const q of [enums_1.QuotaQuarter.Q1, enums_1.QuotaQuarter.Q2, enums_1.QuotaQuarter.Q3, enums_1.QuotaQuarter.Q4]) {
            const result = await this.applyQuarterlyCreditPenalty(currentYear, q);
            allResults.push({ year: currentYear, quarter: q, ...result });
        }
        return {
            year: currentYear,
            quarterResults: allResults,
        };
    }
    async handleAutoArchive() {
        const cutoff = (0, dayjs_1.default)().subtract(AUTO_ARCHIVE_DAYS, 'day').toDate();
        const closedDisputes = await this.prisma.disputeCase.findMany({
            where: {
                status: enums_1.DisputeStatus.CLOSED,
                closedAt: { lte: cutoff },
            },
            select: { id: true, disputeNo: true },
        });
        if (closedDisputes.length === 0)
            return;
        const ids = closedDisputes.map((d) => d.id);
        await this.prisma.disputeCase.updateMany({
            where: { id: { in: ids } },
            data: {
                status: enums_1.DisputeStatus.ARCHIVED,
                archivedAt: new Date(),
                updatedAt: new Date(),
            },
        });
        console.log(`[Cron] 纠纷自动归档: ${closedDisputes.length}条已结案超${AUTO_ARCHIVE_DAYS}天的纠纷已归档`);
    }
};
exports.DisputeMediationService = DisputeMediationService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: 'dispute_auto_archive' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DisputeMediationService.prototype, "handleAutoArchive", null);
exports.DisputeMediationService = DisputeMediationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        credit_rating_service_1.CreditRatingService])
], DisputeMediationService);
//# sourceMappingURL=dispute-mediation.service.js.map