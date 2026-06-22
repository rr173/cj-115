import { GroundwaterService } from './groundwater.service';
import { CreateIrrigationZoneDto, UpdateIrrigationZoneDto, AdjustRedlineDto, RecordWaterLevelDepthDto, CreatePumpingWellDto, UpdatePumpingWellDto, GenerateJointSupplyPlanDto, AddZoneChannelDto, RegisterSmartMeterDto, UpdateSmartMeterDto, UpdateCoefficientDto, ReportMeterReadingDto, ResolveMeterAbnormalDto, CreateElectricityQuotaDto, UpdateElectricityQuotaDto } from './dto';
export declare class GroundwaterController {
    private readonly service;
    constructor(service: GroundwaterService);
    createZone(dto: CreateIrrigationZoneDto): Promise<{
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
    updateZone(zoneId: string, dto: UpdateIrrigationZoneDto): Promise<{
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
    listZones(): Promise<({
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
    getZoneLedger(zoneId: string, year?: string): Promise<{
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
    createWell(dto: CreatePumpingWellDto): Promise<{
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
    updateWell(wellId: string, dto: UpdatePumpingWellDto): Promise<{
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
    listWells(zoneId?: string): Promise<({
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
    getWellHistory(wellId: string, dateFrom?: string, dateTo?: string): Promise<{
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
    generatePlan(dto: GenerateJointSupplyPlanDto): Promise<{
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
    executePlan(dto: GenerateJointSupplyPlanDto): Promise<{
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
    getSupplyPlan(applicationId: string): Promise<{
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
    listAlerts(zoneId?: string, resolved?: string): Promise<({
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
    registerMeter(dto: RegisterSmartMeterDto): Promise<{
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
    updateMeter(meterId: string, dto: UpdateSmartMeterDto): Promise<{
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
    listMeters(zoneId?: string): Promise<({
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
    getMeter(meterId: string): Promise<{
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
    updateCoefficient(dto: UpdateCoefficientDto): Promise<{
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
    reportReading(dto: ReportMeterReadingDto): Promise<{
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
    listReadings(wellId?: string, meterId?: string, dateFrom?: string, dateTo?: string): Promise<({
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
    listAbnormalAlerts(resolved?: string): Promise<({
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
    resolveAbnormal(dto: ResolveMeterAbnormalDto): Promise<{
        alertId: string;
        meterNo: string;
        oldBaseline: number;
        newBaseline: any;
        operator: any;
        resolvedAt: Date;
    }>;
    createQuota(dto: CreateElectricityQuotaDto): Promise<{
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
    updateQuota(quotaId: string, dto: UpdateElectricityQuotaDto): Promise<{
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
    listQuotas(zoneId?: string): Promise<{
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
    getQuotaUsage(quotaId: string): Promise<{
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
