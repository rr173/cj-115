import { GroundwaterService } from './groundwater.service';
import { CreateIrrigationZoneDto, UpdateIrrigationZoneDto, AdjustRedlineDto, RecordWaterLevelDepthDto, CreatePumpingWellDto, UpdatePumpingWellDto, GenerateJointSupplyPlanDto, AddZoneChannelDto } from './dto';
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
}
