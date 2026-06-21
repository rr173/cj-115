import { GateControlMode, WaterLevelAlertType } from '../common/enums';
export declare class CreateMonitorDto {
    code: string;
    channelId: string;
    installPosition: number;
    normalLower: number;
    normalUpper: number;
    alertOverUpper: number;
    alertBelowLower: number;
}
export declare class WaterLevelReadingItemDto {
    monitorId: string;
    value: number;
    timestamp: string;
}
export declare class ReportReadingsDto {
    readings: WaterLevelReadingItemDto[];
}
export declare class CreateGateDto {
    code: string;
    channelId: string;
    maxOpening: number;
}
export declare class ManualGateOpeningDto {
    targetOpening: number;
}
export declare class SwitchGateModeDto {
    controlMode: GateControlMode;
}
export declare class QueryReadingsDto {
    startTime?: string;
    endTime?: string;
}
export declare class QueryAlertsDto {
    type?: WaterLevelAlertType;
    channelId?: string;
    unresolvedOnly?: boolean;
}
