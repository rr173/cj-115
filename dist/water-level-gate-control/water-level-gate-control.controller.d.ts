import { WaterLevelGateControlService } from './water-level-gate-control.service';
import { CreateMonitorDto, ReportReadingsDto, CreateGateDto, ManualGateOpeningDto, SwitchGateModeDto } from './dto';
export declare class WaterLevelGateControlController {
    private readonly service;
    constructor(service: WaterLevelGateControlService);
    createMonitor(dto: CreateMonitorDto): Promise<{
        channel: {
            name: string;
            code: string;
            id: string;
        };
    } & {
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        channelId: string;
        status: string;
        installPosition: number;
        normalLower: number;
        normalUpper: number;
        alertOverUpper: number;
        alertBelowLower: number;
        lastReadingAt: Date | null;
    }>;
    getChannelMonitors(channelId: string): Promise<any[]>;
    reportReadings(dto: ReportReadingsDto): Promise<{
        count: number;
        readings: any[];
    }>;
    getMonitorHistory(monitorId: string, startTime?: string, endTime?: string): Promise<{
        monitor: {
            id: string;
            code: string;
            channelId: string;
        };
        readings: {
            id: string;
            createdAt: Date;
            monitorId: string;
            value: number;
            timestamp: Date;
        }[];
    }>;
    createGate(dto: CreateGateDto): Promise<{
        channel: {
            name: string;
            code: string;
            id: string;
        };
    } & {
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        channelId: string;
        maxOpening: number;
        controlMode: string;
        currentOpening: number;
        lastAdjustedAt: Date | null;
    }>;
    getGateStatus(gateId: string): Promise<{
        id: string;
        code: string;
        channel: {
            name: string;
            code: string;
            id: string;
        };
        maxOpening: number;
        currentOpening: number;
        controlMode: string;
        lastAdjustedAt: Date;
        recentAdjustments: {
            id: string;
            createdAt: Date;
            channelId: string;
            reason: string;
            targetOpening: number;
            gateId: string;
            previousOpening: number;
        }[];
    }>;
    manualSetOpening(gateId: string, dto: ManualGateOpeningDto): Promise<{
        gateId: string;
        previousOpening: number;
        targetOpening: number;
        mode: string;
    }>;
    switchGateMode(gateId: string, dto: SwitchGateModeDto): Promise<{
        gateId: string;
        controlMode: import("../common/enums").GateControlMode;
    }>;
    getAlerts(type?: string, channelId?: string, unresolvedOnly?: string): Promise<({
        channel: {
            name: string;
            code: string;
            id: string;
        };
        monitor: {
            code: string;
            id: string;
        };
    } & {
        type: string;
        id: string;
        createdAt: Date;
        channelId: string;
        monitorId: string | null;
        value: number | null;
        threshold: number | null;
        message: string;
        isResolved: boolean;
        resolvedAt: Date | null;
    })[]>;
}
