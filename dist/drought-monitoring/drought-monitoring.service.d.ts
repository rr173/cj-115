import { PrismaService } from '../prisma/prisma.service';
import { CreditRatingService } from '../credit-rating/credit-rating.service';
import { DroughtStatus, EmergencyLevel } from '../common/enums';
import { ReportWaterSourceDto, QueryDroughtEventsDto, CreateChannelTransferDto, QueryChannelTransfersDto, QuerySupplyDemandTrendDto } from './dto';
export declare class DroughtMonitoringService {
    private prisma;
    private creditRatingService;
    private currentDroughtStatus;
    private pendingRecovery;
    private latestActualFlow;
    private latestDemandFlow;
    private latestRatio;
    constructor(prisma: PrismaService, creditRatingService: CreditRatingService);
    reportWaterSource(dto: ReportWaterSourceDto): Promise<{
        id: string;
        createdAt: Date;
        channelId: string;
        flow: number;
        reportedAt: Date;
    }>;
    private evaluateDroughtStatus;
    private calcCurrentDemandFlow;
    private recordSnapshot;
    private executeLevel1Response;
    private executeLevel2Response;
    processPendingRecovery(): Promise<void>;
    private restoreAllAllocations;
    getStatus(): Promise<{
        supplyDemandRatio: number;
        droughtStatus: DroughtStatus;
        droughtStatusName: string;
        actualFlow: number;
        demandFlow: number;
        emergencyLevel: EmergencyLevel;
        emergencyLevelName: string;
        pendingRecovery: boolean;
    }>;
    getDroughtEvents(dto: QueryDroughtEventsDto): Promise<{
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
        droughtStatus: DroughtStatus.TENSE | DroughtStatus.SEVERE;
        droughtStatusName: string;
    }>;
    manualLiftEmergency(): Promise<{
        lifted: boolean;
        previousStatus: DroughtStatus.TENSE | DroughtStatus.SEVERE;
        previousStatusName: string;
        currentStatus: DroughtStatus;
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
    getChannelTransfers(dto: QueryChannelTransfersDto): Promise<{
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
    private releaseAllChannelTransfers;
    getSupplyDemandTrend(dto: QuerySupplyDemandTrendDto): Promise<{
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
