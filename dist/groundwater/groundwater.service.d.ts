import { PrismaService } from '../prisma/prisma.service';
import { CreateIrrigationZoneDto, UpdateIrrigationZoneDto, AdjustRedlineDto, RecordWaterLevelDepthDto, CreatePumpingWellDto, UpdatePumpingWellDto, GenerateJointSupplyPlanDto } from './dto';
export declare class GroundwaterService {
    private prisma;
    constructor(prisma: PrismaService);
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
}
