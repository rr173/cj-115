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
exports.GroundwaterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const dayjs_1 = __importDefault(require("dayjs"));
const enums_1 = require("../common/enums");
const REDLINE_WARNING_RATIO = 0.9;
let GroundwaterService = class GroundwaterService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createIrrigationZone(dto) {
        const existing = await this.prisma.irrigationZone.findUnique({
            where: { code: dto.code },
        });
        if (existing) {
            throw new common_1.BadRequestException('分区编号已存在');
        }
        const zone = await this.prisma.irrigationZone.create({
            data: {
                code: dto.code,
                name: dto.name,
                annualExtractionRedline: dto.annualExtractionRedline,
                currentWaterLevelDepth: dto.currentWaterLevelDepth,
                warningDepth: dto.warningDepth,
                recoverableCoefficient: dto.recoverableCoefficient ?? 10000,
                isOverExtracted: dto.currentWaterLevelDepth >= dto.warningDepth,
            },
        });
        await this.prisma.waterLevelDepthHistory.create({
            data: {
                zoneId: zone.id,
                depth: dto.currentWaterLevelDepth,
                source: enums_1.DepthSource.MANUAL,
                operator: 'system',
                remark: '初始化',
            },
        });
        if (zone.isOverExtracted) {
            await this.createAlert(zone.id, enums_1.GroundwaterAlertType.DEPTH_EXCEEDED, enums_1.GroundwaterAlertLevel.CRITICAL, `分区[${zone.name}]初始水位埋深${zone.currentWaterLevelDepth}m已超过警戒埋深${zone.warningDepth}m`);
        }
        return zone;
    }
    async updateIrrigationZone(zoneId, dto) {
        const zone = await this.prisma.irrigationZone.findUnique({
            where: { id: zoneId },
        });
        if (!zone)
            throw new common_1.NotFoundException('灌溉分区不存在');
        return this.prisma.irrigationZone.update({
            where: { id: zoneId },
            data: dto,
        });
    }
    async listIrrigationZones() {
        return this.prisma.irrigationZone.findMany({
            include: {
                _count: { select: { wells: true } },
            },
            orderBy: { code: 'asc' },
        });
    }
    async getZoneWaterLedger(zoneId, year) {
        const zone = await this.prisma.irrigationZone.findUnique({
            where: { id: zoneId },
            include: { wells: true },
        });
        if (!zone)
            throw new common_1.NotFoundException('灌溉分区不存在');
        const targetYear = year ?? (0, dayjs_1.default)().year();
        const yearStart = (0, dayjs_1.default)(`${targetYear}-01-01`).startOf('year').toDate();
        const yearEnd = (0, dayjs_1.default)(`${targetYear}-01-01`).endOf('year').toDate();
        const extractionRecords = await this.prisma.groundwaterExtractionRecord.findMany({
            where: {
                zoneId,
                startTime: { gte: yearStart, lte: yearEnd },
            },
        });
        const annualExtracted = extractionRecords.reduce((sum, r) => sum + r.volume, 0);
        const redlineRemaining = Math.max(0, zone.annualExtractionRedline - annualExtracted);
        const redlineUsageRatio = zone.annualExtractionRedline > 0
            ? annualExtracted / zone.annualExtractionRedline
            : 0;
        const canalSupplyApps = await this.prisma.waterApplication.findMany({
            where: {
                targetDate: { gte: yearStart, lte: yearEnd },
                status: { in: ['SCHEDULED', 'EXECUTED'] },
            },
            include: { allocations: true },
        });
        let canalSuppliedVolume = 0;
        for (const app of canalSupplyApps) {
            for (const alloc of app.allocations) {
                const durationSec = (new Date(alloc.endTime).getTime() - new Date(alloc.startTime).getTime()) / 1000;
                canalSuppliedVolume += alloc.flow * durationSec;
            }
        }
        const unresolvedAlerts = await this.prisma.groundwaterAlert.findMany({
            where: { zoneId, isResolved: false },
            orderBy: { triggeredAt: 'desc' },
        });
        return {
            zone: {
                id: zone.id,
                code: zone.code,
                name: zone.name,
                annualExtractionRedline: zone.annualExtractionRedline,
                warningDepth: zone.warningDepth,
                recoverableCoefficient: zone.recoverableCoefficient,
            },
            year: targetYear,
            surfaceWaterSupply: +canalSuppliedVolume.toFixed(2),
            groundwaterExtraction: +annualExtracted.toFixed(2),
            redlineRemaining: +redlineRemaining.toFixed(2),
            redlineUsageRatio: +(redlineUsageRatio * 100).toFixed(2) + '%',
            redlineStatus: redlineUsageRatio >= 1
                ? '已达红线'
                : redlineUsageRatio >= REDLINE_WARNING_RATIO
                    ? '接近红线(预警)'
                    : '正常',
            currentWaterLevelDepth: zone.currentWaterLevelDepth,
            depthStatus: zone.currentWaterLevelDepth >= zone.warningDepth
                ? '超警戒(超采)'
                : zone.currentWaterLevelDepth >= zone.warningDepth * 0.9
                    ? '接近警戒'
                    : '正常',
            isOverExtracted: zone.isOverExtracted,
            wellCount: zone.wells.length,
            activeWells: zone.wells.filter((w) => w.isActive).length,
            unresolvedAlerts: unresolvedAlerts.map((a) => ({
                id: a.id,
                type: a.type,
                level: a.level,
                message: a.message,
                triggeredAt: a.triggeredAt,
            })),
        };
    }
    async adjustRedline(dto) {
        const zone = await this.prisma.irrigationZone.findUnique({
            where: { id: dto.zoneId },
        });
        if (!zone)
            throw new common_1.NotFoundException('灌溉分区不存在');
        if (dto.newRedline < zone.annualExtractedVolume) {
            throw new common_1.BadRequestException(`新红线${dto.newRedline}m³不能小于当年已开采量${zone.annualExtractedVolume.toFixed(2)}m³`);
        }
        const updated = await this.prisma.irrigationZone.update({
            where: { id: dto.zoneId },
            data: { annualExtractionRedline: dto.newRedline },
        });
        return {
            zoneId: updated.id,
            oldRedline: zone.annualExtractionRedline,
            newRedline: dto.newRedline,
            reason: dto.reason,
            operator: dto.operator,
            adjustedAt: new Date(),
        };
    }
    async recordWaterLevelDepth(dto) {
        const zone = await this.prisma.irrigationZone.findUnique({
            where: { id: dto.zoneId },
        });
        if (!zone)
            throw new common_1.NotFoundException('灌溉分区不存在');
        const wasOverExtracted = zone.isOverExtracted;
        const isNowOverExtracted = dto.measuredDepth >= zone.warningDepth;
        const updated = await this.prisma.irrigationZone.update({
            where: { id: dto.zoneId },
            data: {
                currentWaterLevelDepth: dto.measuredDepth,
                isOverExtracted: isNowOverExtracted,
            },
        });
        await this.prisma.waterLevelDepthHistory.create({
            data: {
                zoneId: dto.zoneId,
                depth: dto.measuredDepth,
                source: enums_1.DepthSource.MEASURED,
                operator: dto.operator,
                remark: dto.remark,
            },
        });
        if (!wasOverExtracted && isNowOverExtracted) {
            await this.createAlert(dto.zoneId, enums_1.GroundwaterAlertType.DEPTH_EXCEEDED, enums_1.GroundwaterAlertLevel.CRITICAL, `分区[${zone.name}]实测水位埋深${dto.measuredDepth}m超过警戒埋深${zone.warningDepth}m，触发超采告警`);
        }
        else if (wasOverExtracted && !isNowOverExtracted) {
            await this.resolveAlerts(dto.zoneId, enums_1.GroundwaterAlertType.DEPTH_EXCEEDED);
        }
        return {
            zoneId: updated.id,
            previousDepth: zone.currentWaterLevelDepth,
            measuredDepth: dto.measuredDepth,
            wasOverExtracted,
            isNowOverExtracted,
            operator: dto.operator,
            recordedAt: new Date(),
        };
    }
    async createPumpingWell(dto) {
        const zone = await this.prisma.irrigationZone.findUnique({
            where: { id: dto.zoneId },
        });
        if (!zone)
            throw new common_1.NotFoundException('灌溉分区不存在');
        const existingCode = await this.prisma.pumpingWell.findUnique({
            where: { code: dto.code },
        });
        if (existingCode) {
            throw new common_1.BadRequestException('机井编号已存在');
        }
        if (dto.associatedChannelId) {
            const channel = await this.prisma.channel.findUnique({
                where: { id: dto.associatedChannelId },
            });
            if (!channel)
                throw new common_1.NotFoundException('关联农渠不存在');
        }
        return this.prisma.pumpingWell.create({
            data: {
                code: dto.code,
                zoneId: dto.zoneId,
                ratedFlow: dto.ratedFlow,
                unitCost: dto.unitCost,
                associatedChannelId: dto.associatedChannelId,
                associatedPlot: dto.associatedPlot,
            },
            include: { zone: { select: { id: true, code: true, name: true } } },
        });
    }
    async updatePumpingWell(wellId, dto) {
        const well = await this.prisma.pumpingWell.findUnique({
            where: { id: wellId },
        });
        if (!well)
            throw new common_1.NotFoundException('机井不存在');
        if (dto.zoneId) {
            const zone = await this.prisma.irrigationZone.findUnique({
                where: { id: dto.zoneId },
            });
            if (!zone)
                throw new common_1.NotFoundException('灌溉分区不存在');
        }
        if (dto.associatedChannelId) {
            const channel = await this.prisma.channel.findUnique({
                where: { id: dto.associatedChannelId },
            });
            if (!channel)
                throw new common_1.NotFoundException('关联农渠不存在');
        }
        return this.prisma.pumpingWell.update({
            where: { id: wellId },
            data: dto,
            include: { zone: { select: { id: true, code: true, name: true } } },
        });
    }
    async listPumpingWells(zoneId) {
        const where = {};
        if (zoneId)
            where.zoneId = zoneId;
        return this.prisma.pumpingWell.findMany({
            where,
            include: { zone: { select: { id: true, code: true, name: true } } },
            orderBy: { code: 'asc' },
        });
    }
    async getPumpingWellHistory(wellId, dateFrom, dateTo) {
        const well = await this.prisma.pumpingWell.findUnique({
            where: { id: wellId },
            include: { zone: { select: { id: true, code: true, name: true } } },
        });
        if (!well)
            throw new common_1.NotFoundException('机井不存在');
        const where = { wellId };
        if (dateFrom || dateTo) {
            where.startTime = {};
            if (dateFrom)
                where.startTime.gte = (0, dayjs_1.default)(dateFrom).startOf('day').toDate();
            if (dateTo)
                where.startTime.lt = (0, dayjs_1.default)(dateTo).add(1, 'day').startOf('day').toDate();
        }
        const records = await this.prisma.groundwaterExtractionRecord.findMany({
            where,
            include: {
                application: { include: { farmer: { select: { code: true, name: true } } } },
            },
            orderBy: { startTime: 'desc' },
        });
        const totalVolume = records.reduce((sum, r) => sum + r.volume, 0);
        const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
        const totalHours = records.reduce((sum, r) => sum + r.durationHours, 0);
        return {
            well: {
                id: well.id,
                code: well.code,
                ratedFlow: well.ratedFlow,
                unitCost: well.unitCost,
                isActive: well.isActive,
                zone: well.zone,
            },
            summary: {
                extractionCount: records.length,
                totalVolume: +totalVolume.toFixed(2),
                totalCost: +totalCost.toFixed(2),
                totalRunningHours: +totalHours.toFixed(2),
            },
            records: records.map((r) => ({
                id: r.id,
                volume: r.volume,
                durationHours: r.durationHours,
                cost: r.cost,
                startTime: r.startTime,
                endTime: r.endTime,
                application: r.application
                    ? {
                        id: r.application.id,
                        farmerCode: r.application.farmer?.code,
                        farmerName: r.application.farmer?.name,
                    }
                    : null,
            })),
        };
    }
    async generateJointSupplyPlan(dto) {
        const application = await this.prisma.waterApplication.findUnique({
            where: { id: dto.applicationId },
            include: {
                farmer: { include: { channel: true } },
                allocations: true,
            },
        });
        if (!application)
            throw new common_1.NotFoundException('用水申请不存在');
        const requestedVolume = application.requestVolume;
        let canalSuppliedVolume = 0;
        for (const alloc of application.allocations) {
            const durationSec = (new Date(alloc.endTime).getTime() - new Date(alloc.startTime).getTime()) / 1000;
            canalSuppliedVolume += alloc.flow * durationSec;
        }
        let gapVolume = Math.max(0, requestedVolume - canalSuppliedVolume);
        const farmer = application.farmer;
        const channelId = farmer.channelId;
        let zone = await this.prisma.irrigationZone.findFirst({
            where: { wells: { some: { associatedChannelId: channelId, isActive: true } } },
            include: { wells: { where: { isActive: true }, orderBy: { unitCost: 'asc' } } },
        });
        if (!zone) {
            const zones = await this.prisma.irrigationZone.findMany({
                include: { wells: { where: { isActive: true }, orderBy: { unitCost: 'asc' } } },
            });
            if (zones.length > 0)
                zone = zones[0];
        }
        let wellSuppliedVolume = 0;
        let totalCost = 0;
        const wellDetails = [];
        const warnings = [];
        const errors = [];
        if (gapVolume > 0 && zone) {
            if (zone.currentWaterLevelDepth >= zone.warningDepth) {
                errors.push(`分区[${zone.name}]水位埋深${zone.currentWaterLevelDepth}m已超过警戒埋深${zone.warningDepth}m，禁止启用机井`);
            }
            else {
                const remainingRedline = Math.max(0, zone.annualExtractionRedline - zone.annualExtractedVolume);
                if (remainingRedline <= 0) {
                    errors.push(`分区[${zone.name}]年度开采量已达红线${zone.annualExtractionRedline}m³，禁止新增开采`);
                }
                else {
                    const usageRatio = zone.annualExtractionRedline > 0
                        ? zone.annualExtractedVolume / zone.annualExtractionRedline
                        : 0;
                    if (usageRatio >= REDLINE_WARNING_RATIO) {
                        warnings.push(`分区[${zone.name}]已开采${zone.annualExtractedVolume.toFixed(2)}m³，占红线${(usageRatio * 100).toFixed(1)}%，接近红线预警`);
                    }
                    const availableVolume = Math.min(gapVolume, remainingRedline);
                    for (const well of zone.wells) {
                        if (wellSuppliedVolume >= availableVolume)
                            break;
                        const needVolume = availableVolume - wellSuppliedVolume;
                        const durationHours = needVolume / well.ratedFlow;
                        const actualVolume = Math.min(needVolume, well.ratedFlow * durationHours);
                        const cost = actualVolume * well.unitCost;
                        wellSuppliedVolume += actualVolume;
                        totalCost += cost;
                        wellDetails.push({
                            wellId: well.id,
                            wellCode: well.code,
                            ratedFlow: well.ratedFlow,
                            unitCost: well.unitCost,
                            suppliedVolume: +actualVolume.toFixed(2),
                            durationHours: +durationHours.toFixed(2),
                            cost: +cost.toFixed(2),
                        });
                    }
                    if (wellSuppliedVolume < gapVolume) {
                        warnings.push(`缺口${gapVolume.toFixed(2)}m³仅补满${wellSuppliedVolume.toFixed(2)}m³，剩余${(gapVolume - wellSuppliedVolume).toFixed(2)}m³无法补足（受开采红线或可用机井限制）`);
                    }
                }
            }
        }
        return {
            application: {
                id: application.id,
                farmerCode: farmer.code,
                farmerName: farmer.name,
                requestedVolume: +requestedVolume.toFixed(2),
            },
            zone: zone
                ? { id: zone.id, code: zone.code, name: zone.name }
                : null,
            canalSuppliedVolume: +canalSuppliedVolume.toFixed(2),
            requiredWellSupplement: +gapVolume.toFixed(2),
            actualWellSuppliedVolume: +wellSuppliedVolume.toFixed(2),
            unsatisfiedVolume: +(gapVolume - wellSuppliedVolume).toFixed(2),
            totalCost: +totalCost.toFixed(2),
            wellDetails,
            warnings,
            errors,
            canSatisfy: errors.length === 0 && wellSuppliedVolume >= gapVolume - 0.01,
        };
    }
    async executeJointSupply(dto) {
        const plan = await this.generateJointSupplyPlan(dto);
        if (plan.errors.length > 0) {
            throw new common_1.BadRequestException(plan.errors.join('; '));
        }
        if (!plan.zone || plan.wellDetails.length === 0) {
            return {
                ...plan,
                executed: false,
                reason: '无需机井补水或无可执行方案',
            };
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const existingPlan = await tx.jointWaterSupplyPlan.findUnique({
                where: { applicationId: dto.applicationId },
            });
            if (existingPlan) {
                throw new common_1.BadRequestException('该申请已存在联合供水方案');
            }
            const supplyPlan = await tx.jointWaterSupplyPlan.create({
                data: {
                    applicationId: dto.applicationId,
                    zoneId: plan.zone.id,
                    requestedVolume: plan.application.requestedVolume,
                    canalSuppliedVolume: plan.canalSuppliedVolume,
                    wellSuppliedVolume: plan.actualWellSuppliedVolume,
                    totalCost: plan.totalCost,
                },
            });
            let totalExtracted = 0;
            const records = [];
            for (const detail of plan.wellDetails) {
                const startTime = new Date();
                const endTime = (0, dayjs_1.default)(startTime).add(detail.durationHours, 'hour').toDate();
                const record = await tx.groundwaterExtractionRecord.create({
                    data: {
                        wellId: detail.wellId,
                        zoneId: plan.zone.id,
                        applicationId: dto.applicationId,
                        planId: supplyPlan.id,
                        volume: detail.suppliedVolume,
                        durationHours: detail.durationHours,
                        cost: detail.cost,
                        startTime,
                        endTime,
                    },
                });
                totalExtracted += detail.suppliedVolume;
                records.push(record);
                await tx.jointSupplyDetail.create({
                    data: {
                        planId: supplyPlan.id,
                        wellId: detail.wellId,
                        volume: detail.suppliedVolume,
                        durationHours: detail.durationHours,
                        cost: detail.cost,
                    },
                });
            }
            const zone = await tx.irrigationZone.findUnique({
                where: { id: plan.zone.id },
            });
            if (!zone)
                throw new common_1.NotFoundException('分区不存在');
            const newAnnualExtracted = zone.annualExtractedVolume + totalExtracted;
            const depthIncrement = totalExtracted / zone.recoverableCoefficient;
            const newDepth = zone.currentWaterLevelDepth + depthIncrement;
            const nowOverExtracted = newDepth >= zone.warningDepth;
            await tx.irrigationZone.update({
                where: { id: plan.zone.id },
                data: {
                    annualExtractedVolume: newAnnualExtracted,
                    currentWaterLevelDepth: newDepth,
                    isOverExtracted: nowOverExtracted,
                    lastExtractedAt: new Date(),
                },
            });
            await tx.waterLevelDepthHistory.create({
                data: {
                    zoneId: plan.zone.id,
                    depth: newDepth,
                    source: enums_1.DepthSource.CALCULATED,
                    operator: 'system',
                    remark: `机井抽水${totalExtracted.toFixed(2)}m³，埋深增加${depthIncrement.toFixed(4)}m`,
                },
            });
            return { supplyPlan, records, newAnnualExtracted, newDepth, nowOverExtracted, zone };
        });
        const usageRatio = result.zone.annualExtractionRedline > 0
            ? result.newAnnualExtracted / result.zone.annualExtractionRedline
            : 0;
        if (usageRatio >= 1) {
            await this.createAlert(plan.zone.id, enums_1.GroundwaterAlertType.REDLINE_BLOCKED, enums_1.GroundwaterAlertLevel.CRITICAL, `分区[${result.zone.name}]年度开采量已达100%红线${result.zone.annualExtractionRedline}m³，后续机井调度将被拦截`);
        }
        else if (usageRatio >= REDLINE_WARNING_RATIO) {
            await this.createAlert(plan.zone.id, enums_1.GroundwaterAlertType.REDLINE_WARNING, enums_1.GroundwaterAlertLevel.WARNING, `分区[${result.zone.name}]年度开采量已达${(usageRatio * 100).toFixed(1)}%，接近红线${result.zone.annualExtractionRedline}m³`);
        }
        if (result.nowOverExtracted && !result.zone.isOverExtracted) {
            await this.createAlert(plan.zone.id, enums_1.GroundwaterAlertType.DEPTH_EXCEEDED, enums_1.GroundwaterAlertLevel.CRITICAL, `分区[${result.zone.name}]水位埋深${result.newDepth.toFixed(3)}m超过警戒埋深${result.zone.warningDepth}m，触发超采告警`);
        }
        return {
            ...plan,
            executed: true,
            planId: result.supplyPlan.id,
            updatedZoneStatus: {
                newAnnualExtracted: +result.newAnnualExtracted.toFixed(2),
                newWaterLevelDepth: +result.newDepth.toFixed(3),
                isOverExtracted: result.nowOverExtracted,
                redlineUsagePercent: +(usageRatio * 100).toFixed(2) + '%',
            },
        };
    }
    async getJointSupplyPlan(applicationId) {
        const plan = await this.prisma.jointWaterSupplyPlan.findUnique({
            where: { applicationId },
            include: {
                zone: { select: { id: true, code: true, name: true } },
                application: {
                    include: { farmer: { select: { id: true, code: true, name: true } } },
                },
                details: {
                    include: { well: { select: { id: true, code: true, ratedFlow: true, unitCost: true } } },
                },
            },
        });
        if (!plan)
            throw new common_1.NotFoundException('该申请无联合供水方案');
        return {
            plan: {
                id: plan.id,
                createdAt: plan.createdAt,
                requestedVolume: plan.requestedVolume,
                canalSuppliedVolume: plan.canalSuppliedVolume,
                wellSuppliedVolume: plan.wellSuppliedVolume,
                totalCost: plan.totalCost,
            },
            zone: plan.zone,
            application: {
                id: plan.application.id,
                farmerCode: plan.application.farmer.code,
                farmerName: plan.application.farmer.name,
            },
            wellDetails: plan.details.map((d) => ({
                wellId: d.wellId,
                wellCode: d.well.code,
                ratedFlow: d.well.ratedFlow,
                unitCost: d.well.unitCost,
                volume: d.volume,
                durationHours: d.durationHours,
                cost: d.cost,
            })),
        };
    }
    async listAlerts(zoneId, resolved) {
        const where = {};
        if (zoneId)
            where.zoneId = zoneId;
        if (resolved !== undefined)
            where.isResolved = resolved;
        return this.prisma.groundwaterAlert.findMany({
            where,
            include: { zone: { select: { id: true, code: true, name: true } } },
            orderBy: { triggeredAt: 'desc' },
        });
    }
    async createAlert(zoneId, type, level, message) {
        const existing = await this.prisma.groundwaterAlert.findFirst({
            where: { zoneId, type, isResolved: false },
        });
        if (existing)
            return existing;
        return this.prisma.groundwaterAlert.create({
            data: { zoneId, type, level, message },
        });
    }
    async resolveAlerts(zoneId, type) {
        const where = { zoneId, isResolved: false };
        if (type)
            where.type = type;
        await this.prisma.groundwaterAlert.updateMany({
            where,
            data: { isResolved: true, resolvedAt: new Date() },
        });
    }
};
exports.GroundwaterService = GroundwaterService;
exports.GroundwaterService = GroundwaterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroundwaterService);
//# sourceMappingURL=groundwater.service.js.map