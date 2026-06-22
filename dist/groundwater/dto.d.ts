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
export declare class AddZoneChannelDto {
    zoneId: string;
    channelId: string;
}
export declare class RegisterSmartMeterDto {
    wellId: string;
    meterNo: string;
    initialReading?: number;
    remark?: string;
}
export declare class UpdateSmartMeterDto {
    meterNo?: string;
    status?: string;
    remark?: string;
}
export declare class UpdateCoefficientDto {
    wellId: string;
    coefficient: number;
}
export declare class ReportMeterReadingDto {
    meterNo: string;
    reading: number;
    reportedAt?: string;
}
export declare class ResolveMeterAbnormalDto {
    alertId: string;
    newBaselineReading: number;
    operator: string;
}
export declare class CreateElectricityQuotaDto {
    zoneId: string;
    seasonName: string;
    startDate: string;
    endDate: string;
    totalKwh: number;
    operator?: string;
    remark?: string;
}
export declare class UpdateElectricityQuotaDto {
    totalKwh?: number;
    remark?: string;
}
