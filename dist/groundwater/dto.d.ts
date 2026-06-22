export declare class CreateIrrigationZoneDto {
    code: string;
    name: string;
    annualExtractionRedline: number;
    currentWaterLevelDepth: number;
    warningDepth: number;
    recoverableCoefficient?: number;
}
export declare class UpdateIrrigationZoneDto {
    name?: string;
    annualExtractionRedline?: number;
    warningDepth?: number;
    recoverableCoefficient?: number;
}
export declare class AdjustRedlineDto {
    zoneId: string;
    newRedline: number;
    reason?: string;
    operator?: string;
}
export declare class RecordWaterLevelDepthDto {
    zoneId: string;
    measuredDepth: number;
    operator?: string;
    remark?: string;
}
export declare class CreatePumpingWellDto {
    code: string;
    zoneId: string;
    ratedFlow: number;
    unitCost: number;
    associatedChannelId?: string;
    associatedPlot?: string;
}
export declare class UpdatePumpingWellDto {
    zoneId?: string;
    ratedFlow?: number;
    unitCost?: number;
    associatedChannelId?: string;
    associatedPlot?: string;
    isActive?: boolean;
}
export declare class GenerateJointSupplyPlanDto {
    applicationId: string;
}
