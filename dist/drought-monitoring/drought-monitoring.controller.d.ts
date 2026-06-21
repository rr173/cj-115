import { DroughtMonitoringService } from './drought-monitoring.service';
import { ReportWaterSourceDto, CreateChannelTransferDto } from './dto';
export declare class DroughtMonitoringController {
    private readonly service;
    constructor(service: DroughtMonitoringService);
    reportWaterSource(dto: ReportWaterSourceDto): Promise<{
        id: string;
        createdAt: Date;
        channelId: string;
        flow: number;
        reportedAt: Date;
    }>;
    getStatus(): Promise<{
        supplyDemandRatio: number;
        droughtStatus: import("../common/enums").DroughtStatus;
        droughtStatusName: string;
        actualFlow: number;
        demandFlow: number;
        emergencyLevel: import("../common/enums").EmergencyLevel;
        emergencyLevelName: string;
        pendingRecovery: boolean;
    }>;
    getDroughtEvents(level?: string, startTime?: string, endTime?: string): Promise<{
        id: string;
        level: string;
        levelName: string;
        previousLevel: string;
        previousLevelName: string;
        supplyDemandRatio: number;
        actualFlow: number;
        demandFlow: number;
        emergencyLevel: string;
        emergencyLevelName: string;
        message: string;
        createdAt: Date;
    }[]>;
    getAffectedAllocations(): Promise<{
        suspended: {
            id: string;
            applicationId: string;
            farmer: {
                id: string;
                code: string;
                name: string;
            };
            channel: {
                name: string;
                code: string;
                id: string;
            };
            startTime: Date;
            endTime: Date;
            flow: number;
            droughtStatus: string;
            droughtStatusName: string;
        }[];
        reduced: {
            id: string;
            applicationId: string;
            farmer: {
                id: string;
                code: string;
                name: string;
            };
            channel: {
                name: string;
                code: string;
                id: string;
            };
            startTime: Date;
            endTime: Date;
            originalFlow: number;
            reducedFlow: number;
            reductionAmount: number;
            droughtStatus: string;
            droughtStatusName: string;
        }[];
    }>;
    manualTriggerEmergency(): Promise<{
        triggered: boolean;
        emergencyLevel: string;
        emergencyLevelName: string;
        supplyDemandRatio: number;
        droughtStatus: import("../common/enums").DroughtStatus.TENSE | import("../common/enums").DroughtStatus.SEVERE;
        droughtStatusName: string;
    }>;
    manualLiftEmergency(): Promise<{
        lifted: boolean;
        previousStatus: import("../common/enums").DroughtStatus.TENSE | import("../common/enums").DroughtStatus.SEVERE;
        previousStatusName: string;
        currentStatus: import("../common/enums").DroughtStatus;
        currentStatusName: string;
    }>;
    createChannelTransfer(dto: CreateChannelTransferDto): Promise<{
        id: string;
        sourceChannel: {
            name: string;
            code: string;
            maxFlow: number;
            id: string;
        };
        targetChannel: {
            name: string;
            code: string;
            maxFlow: number;
            id: string;
        };
        transferredCapacity: number;
        status: string;
        statusName: string;
        createdAt: Date;
    }>;
    getChannelTransfers(status?: string): Promise<{
        id: string;
        sourceChannel: {
            name: string;
            code: string;
            maxFlow: number;
            id: string;
        };
        targetChannel: {
            name: string;
            code: string;
            maxFlow: number;
            id: string;
        };
        transferredCapacity: number;
        status: string;
        statusName: string;
        createdAt: Date;
        releasedAt: Date;
    }[]>;
    getSupplyDemandTrend(startTime: string, endTime: string): Promise<{
        startTime: string;
        endTime: string;
        data: {
            hour: Date;
            actualFlow: number;
            demandFlow: number;
            supplyDemandRatio: number;
            droughtStatus: string;
            droughtStatusName: string;
        }[];
    }>;
    getChannelEffectiveCapacity(channelId: string): Promise<{
        channelId: string;
        channelCode: string;
        channelName: string;
        designCapacity: number;
        borrowedCapacity: number;
        effectiveCapacity: number;
    }>;
}
