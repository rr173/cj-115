import { ProblemLevel } from '../common/enums';
export declare class CreateInspectionDto {
    channelId: string;
    inspectorName: string;
    inspectionDate: string;
    description: string;
    problemLevel: ProblemLevel;
    leakageRate?: number;
    siltDepth?: number;
    liningDamageLength?: number;
}
export declare class CreateMaintenanceOrderDto {
    channelId: string;
    planStartDate: string;
    estimatedDurationDays: number;
    crewCode: string;
}
export declare class ListInspectionsDto {
    channelId?: string;
    startDate?: string;
    endDate?: string;
}
export declare class InspectionStatisticsDto {
    channelId: string;
    startDate: string;
    endDate: string;
}
export declare class StopWaterQueryDto {
    startDate: string;
    endDate: string;
}
