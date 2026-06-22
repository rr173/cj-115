import { PrismaService } from '../prisma/prisma.service';
import { CreateIrrigationZoneDto, UpdateIrrigationZoneDto, AdjustRedlineDto, RecordWaterLevelDepthDto, CreatePumpingWellDto, UpdatePumpingWellDto, GenerateJointSupplyPlanDto, AddZoneChannelDto } from './dto';
export declare class GroundwaterService {
    private prisma;
    constructor(prisma: PrismaService);
    private calcCanalSupplyFromAlloc;
    private calcAppCanalSupply;
    createIrrigationZone(dto: CreateIrrigationZoneDto): Promise<{
        name: string;
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        annualExtractionRedline: number;
        currentWaterLevelDepth: number;
        warningDepth: number;
        recoverableCoefficient: number;
        annualExtractedVolume: number;
        lastExtractedAt: Date | null;
        isOverExtracted: boolean;
    }>;
    updateIrrigationZone(zoneId: string, dto: UpdateIrrigationZoneDto): Promise<{
        name: string;
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        annualExtractionRedline: number;
        currentWaterLevelDepth: number;
        warningDepth: number;
        recoverableCoefficient: number;
        annualExtractedVolume: number;
        lastExtractedAt: Date | null;
        isOverExtracted: boolean;
    }>;
    listIrrigationZones(): Promise<({
        _count: {
            wells: number;
            channelCoverages: number;
        };
    } & {
        name: string;
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        annualExtractionRedline: number;
        currentWaterLevelDepth: number;
        warningDepth: number;
        recoverableCoefficient: number;
        annualExtractedVolume: number;
        lastExtractedAt: Date | null;
        isOverExtracted: boolean;
    })[]>;
    getZoneWaterLedger(zoneId: string, year?: number): Promise<{
        zone: {
            id: string;
            code: string;
            name: string;
            annualExtractionRedline: number;
            warningDepth: number;
            recoverableCoefficient: number;
        };
        year: number;
        surfaceWaterSupply: number;
        groundwaterExtraction: number;
        redlineRemaining: number;
        redlineUsageRatio: string;
        redlineStatus: string;
        currentWaterLevelDepth: number;
        depthStatus: string;
        isOverExtracted: boolean;
        wellCount: number;
        activeWells: number;
        coveredChannelCount: number;
        unresolvedAlerts: {
            id: string;
            type: string;
            level: string;
            message: string;
            triggeredAt: Date;
        }[];
    }>;
    adjustRedline(dto: AdjustRedlineDto): Promise<{
        zoneId: string;
        oldRedline: number;
        newRedline: number;
        reason: string;
        operator: string;
        adjustedAt: Date;
    }>;
    recordWaterLevelDepth(dto: RecordWaterLevelDepthDto): Promise<{
        zoneId: string;
        previousDepth: number;
        measuredDepth: number;
        wasOverExtracted: boolean;
        isNowOverExtracted: boolean;
        operator: string;
        recordedAt: Date;
    }>;
    addZoneChannel(dto: AddZoneChannelDto): Promise<{
        channel: {
            name: string;
            code: string;
            level: string;
            id: string;
        };
        zone: {
            name: string;
            code: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        channelId: string;
        zoneId: string;
    }>;
    removeZoneChannel(zoneId: string, channelId: string): Promise<{
        id: string;
        createdAt: Date;
        channelId: string;
        zoneId: string;
    }>;
    getZoneChannels(zoneId: string): Promise<({
        channel: {
            name: string;
            code: string;
            level: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        channelId: string;
        zoneId: string;
    })[]>;
    createPumpingWell(dto: CreatePumpingWellDto): Promise<{
        zone: {
            name: string;
            code: string;
            id: string;
        };
    } & {
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        zoneId: string;
        ratedFlow: number;
        unitCost: number;
        associatedChannelId: string | null;
        associatedPlot: string | null;
        electricityToWaterCoefficient: number;
    }>;
    updatePumpingWell(wellId: string, dto: UpdatePumpingWellDto): Promise<{
        zone: {
            name: string;
            code: string;
            id: string;
        };
    } & {
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        zoneId: string;
        ratedFlow: number;
        unitCost: number;
        associatedChannelId: string | null;
        associatedPlot: string | null;
        electricityToWaterCoefficient: number;
    }>;
    listPumpingWells(zoneId?: string): Promise<({
        zone: {
            name: string;
            code: string;
            id: string;
        };
    } & {
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        zoneId: string;
        ratedFlow: number;
        unitCost: number;
        associatedChannelId: string | null;
        associatedPlot: string | null;
        electricityToWaterCoefficient: number;
    })[]>;
    getPumpingWellHistory(wellId: string, dateFrom?: string, dateTo?: string): Promise<{
        well: {
            id: string;
            code: string;
            ratedFlow: number;
            unitCost: number;
            isActive: boolean;
            zone: {
                name: string;
                code: string;
                id: string;
            };
        };
        summary: {
            extractionCount: number;
            totalVolume: number;
            totalCost: number;
            totalRunningHours: number;
        };
        records: {
            id: string;
            volume: number;
            durationHours: number;
            cost: number;
            startTime: Date;
            endTime: Date;
            application: {
                id: string;
                farmerCode: string;
                farmerName: string;
            };
        }[];
    }>;
    generateJointSupplyPlan(dto: GenerateJointSupplyPlanDto): Promise<{
        application: {
            id: string;
            farmerCode: string;
            farmerName: string;
            requestedVolume: number;
        };
        zone: {
            id: string;
            code: string;
            name: string;
        };
        canalSuppliedVolume: number;
        requiredWellSupplement: number;
        actualWellSuppliedVolume: number;
        unsatisfiedVolume: number;
        totalCost: number;
        wellDetails: any[];
        warnings: string[];
        errors: string[];
        canSatisfy: boolean;
    }>;
    executeJointSupply(dto: GenerateJointSupplyPlanDto): Promise<{
        executed: boolean;
        reason: string;
        application: {
            id: string;
            farmerCode: string;
            farmerName: string;
            requestedVolume: number;
        };
        zone: {
            id: string;
            code: string;
            name: string;
        };
        canalSuppliedVolume: number;
        requiredWellSupplement: number;
        actualWellSuppliedVolume: number;
        unsatisfiedVolume: number;
        totalCost: number;
        wellDetails: any[];
        warnings: string[];
        errors: string[];
        canSatisfy: boolean;
    } | {
        executed: boolean;
        planId: string;
        updatedZoneStatus: {
            newAnnualExtracted: number;
            newWaterLevelDepth: number;
            isOverExtracted: boolean;
            redlineUsagePercent: string;
        };
        application: {
            id: string;
            farmerCode: string;
            farmerName: string;
            requestedVolume: number;
        };
        zone: {
            id: string;
            code: string;
            name: string;
        };
        canalSuppliedVolume: number;
        requiredWellSupplement: number;
        actualWellSuppliedVolume: number;
        unsatisfiedVolume: number;
        totalCost: number;
        wellDetails: any[];
        warnings: string[];
        errors: string[];
        canSatisfy: boolean;
    }>;
    getJointSupplyPlan(applicationId: string): Promise<{
        plan: {
            id: string;
            createdAt: Date;
            requestedVolume: number;
            canalSuppliedVolume: number;
            wellSuppliedVolume: number;
            totalCost: number;
        };
        zone: {
            name: string;
            code: string;
            id: string;
        };
        application: {
            id: string;
            farmerCode: string;
            farmerName: string;
        };
        wellDetails: {
            wellId: string;
            wellCode: string;
            ratedFlow: number;
            unitCost: number;
            volume: number;
            durationHours: number;
            cost: number;
        }[];
    }>;
    listAlerts(zoneId?: string, resolved?: boolean): Promise<({
        zone: {
            name: string;
            code: string;
            id: string;
        };
    } & {
        type: string;
        level: string;
        id: string;
        zoneId: string;
        message: string;
        isResolved: boolean;
        resolvedAt: Date | null;
        triggeredAt: Date;
    })[]>;
    private createAlert;
    private resolveAlerts;
    registerSmartMeter(dto: any): Promise<{
        well: {
            code: string;
            id: string;
            zone: {
                name: string;
                code: string;
                id: string;
            };
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        remark: string | null;
        wellId: string;
        meterNo: string;
        initialReading: number;
        lastReading: number;
        lastReportedAt: Date | null;
        installedAt: Date;
    }>;
    updateSmartMeter(meterId: string, dto: any): Promise<{
        well: {
            code: string;
            id: string;
            zone: {
                name: string;
                code: string;
                id: string;
            };
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        remark: string | null;
        wellId: string;
        meterNo: string;
        initialReading: number;
        lastReading: number;
        lastReportedAt: Date | null;
        installedAt: Date;
    }>;
    listSmartMeters(zoneId?: string): Promise<({
        well: {
            code: string;
            id: string;
            zone: {
                name: string;
                code: string;
                id: string;
            };
            electricityToWaterCoefficient: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        remark: string | null;
        wellId: string;
        meterNo: string;
        initialReading: number;
        lastReading: number;
        lastReportedAt: Date | null;
        installedAt: Date;
    })[]>;
    getSmartMeter(meterId: string): Promise<{
        well: {
            code: string;
            id: string;
            zone: {
                name: string;
                code: string;
                id: string;
            };
            electricityToWaterCoefficient: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        remark: string | null;
        wellId: string;
        meterNo: string;
        initialReading: number;
        lastReading: number;
        lastReportedAt: Date | null;
        installedAt: Date;
    }>;
    updateCoefficient(dto: any): Promise<{
        wellId: string;
        wellCode: string;
        oldCoefficient: number;
        newCoefficient: any;
        zone: {
            name: string;
            code: string;
            id: string;
        };
    }>;
    reportMeterReading(dto: any): Promise<{
        accepted: boolean;
        abnormal: boolean;
        alertId: string;
        message: string;
        previousReading: number;
        currentReading: any;
        consumption?: undefined;
        waterVolume?: undefined;
        coefficient?: undefined;
        zone?: undefined;
        well?: undefined;
        recordedAt?: undefined;
        quota?: undefined;
    } | {
        accepted: boolean;
        abnormal: boolean;
        message: string;
        previousReading: number;
        currentReading: any;
        consumption: number;
        waterVolume: number;
        alertId?: undefined;
        coefficient?: undefined;
        zone?: undefined;
        well?: undefined;
        recordedAt?: undefined;
        quota?: undefined;
    } | {
        accepted: boolean;
        abnormal: boolean;
        message: string;
        previousReading: number;
        currentReading: any;
        consumption: number;
        coefficient: number;
        waterVolume: number;
        zone: {
            id: string;
            code: string;
            name: string;
        };
        well: {
            id: string;
            code: string;
        };
        recordedAt: Date;
        quota: {
            id: string;
            seasonName: string;
            totalKwh: number;
            usedKwh: number;
            warningTriggered: boolean;
            blocked: boolean;
        };
        alertId?: undefined;
    }>;
    listMeterReadings(wellId?: string, meterId?: string, dateFrom?: string, dateTo?: string): Promise<({
        zone: {
            name: string;
            code: string;
        };
        well: {
            code: string;
        };
        meter: {
            meterNo: string;
        };
    } & {
        id: string;
        createdAt: Date;
        zoneId: string;
        reportedAt: Date;
        wellId: string;
        previousReading: number;
        currentReading: number;
        meterId: string;
        consumption: number;
        isAbnormal: boolean;
        abnormalReason: string | null;
    })[]>;
    listMeterAbnormalAlerts(resolved?: boolean): Promise<({
        meter: {
            status: string;
            meterNo: string;
        };
    } & {
        type: string;
        id: string;
        createdAt: Date;
        message: string;
        isResolved: boolean;
        resolvedAt: Date | null;
        wellId: string;
        newBaselineReading: number | null;
        previousReading: number;
        currentReading: number;
        resolvedBy: string | null;
        meterId: string;
    })[]>;
    resolveMeterAbnormal(dto: any): Promise<{
        alertId: string;
        meterNo: string;
        oldBaseline: number;
        newBaseline: any;
        operator: any;
        resolvedAt: Date;
    }>;
    createElectricityQuota(dto: any): Promise<{
        zone: {
            name: string;
            code: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        remark: string | null;
        startDate: Date;
        endDate: Date;
        zoneId: string;
        operator: string | null;
        seasonName: string;
        totalKwh: number;
        usedKwh: number;
        warningSent: boolean;
        blocked: boolean;
    }>;
    updateElectricityQuota(quotaId: string, dto: any): Promise<{
        zone: {
            name: string;
            code: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        remark: string | null;
        startDate: Date;
        endDate: Date;
        zoneId: string;
        operator: string | null;
        seasonName: string;
        totalKwh: number;
        usedKwh: number;
        warningSent: boolean;
        blocked: boolean;
    }>;
    listElectricityQuotas(zoneId?: string): Promise<{
        usageRatio: string;
        remainingKwh: number;
        status: string;
        zone: {
            name: string;
            code: string;
            id: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        remark: string | null;
        startDate: Date;
        endDate: Date;
        zoneId: string;
        operator: string | null;
        seasonName: string;
        totalKwh: number;
        usedKwh: number;
        warningSent: boolean;
        blocked: boolean;
    }[]>;
    getElectricityQuotaUsage(quotaId: string): Promise<{
        quota: {
            id: string;
            seasonName: string;
            startDate: Date;
            endDate: Date;
            totalKwh: number;
            usedKwh: number;
            remainingKwh: number;
            usageRatio: string;
            status: string;
            warningSent: boolean;
            blocked: boolean;
        };
        zone: {
            name: string;
            code: string;
            id: string;
        };
        recordCount: number;
        totalWaterVolume: number;
        wellBreakdown: {
            wellCode: string;
            recordCount: number;
            totalKwh: number;
            totalWaterVolume: number;
        }[];
        recentRecords: {
            id: string;
            wellCode: string;
            consumptionKwh: number;
            waterVolume: number;
            recordedAt: Date;
        }[];
    }>;
    getWellReconciliation(wellId: string, dateFrom?: string, dateTo?: string): Promise<{
        well: {
            id: string;
            code: string;
            ratedFlow: number;
            electricityToWaterCoefficient: number;
            zone: {
                name: string;
                code: string;
                id: string;
            };
        };
        period: {
            dateFrom: Date;
            dateTo: Date;
        };
        estimated: {
            totalVolume: number;
            recordCount: number;
            totalHours: number;
        };
        electric: {
            totalVolume: number;
            totalKwh: number;
            recordCount: number;
        };
        deviation: {
            diffVolume: number;
            deviationRate: string;
            isAbnormal: boolean;
            abnormalThreshold: string;
            suggestion: string;
        } | {
            diffVolume: number;
            deviationRate: any;
            isAbnormal: boolean;
            suggestion: string;
            abnormalThreshold?: undefined;
        };
    }>;
    getZoneReconciliation(zoneId: string, dateFrom?: string, dateTo?: string): Promise<{
        zone: {
            id: string;
            code: string;
            name: string;
        };
        period: {
            dateFrom: Date;
            dateTo: Date;
        };
        summary: {
            wellCount: number;
            abnormalWellCount: number;
            estimatedTotalVolume: number;
            electricTotalVolume: number;
            diffVolume: number;
            deviationRate: string;
            isAbnormal: boolean;
        };
        wellReports: any[];
    }>;
}
