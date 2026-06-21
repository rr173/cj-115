import { PrismaService } from '../prisma/prisma.service';
import { CreateMonitorDto, CreateGateDto, ReportReadingsDto, ManualGateOpeningDto, SwitchGateModeDto, QueryAlertsDto } from './dto';
import { GateControlMode } from '../common/enums';
export declare class WaterLevelGateControlService {
    private prisma;
    private dryTrackers;
    constructor(prisma: PrismaService);
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
    private processChannelReadings;
    private handleOverflow;
    private applyGateAdjustment;
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
        controlMode: GateControlMode;
    }>;
    getAlerts(query: QueryAlertsDto): Promise<({
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
    checkOfflineMonitors(): Promise<void>;
    private checkAllMonitorsOffline;
    checkDryConditions(): Promise<void>;
    private notifyUpstreamIncrease;
}
