import { DroughtStatus, ChannelTransferStatus } from '../common/enums';
export declare class ReportWaterSourceDto {
    channelId: string;
    flow: number;
    reportedAt?: string;
}
export declare class QueryDroughtEventsDto {
    level?: DroughtStatus;
    startTime?: string;
    endTime?: string;
}
export declare class CreateChannelTransferDto {
    sourceChannelId: string;
    targetChannelId: string;
    transferredCapacity: number;
}
export declare class QueryChannelTransfersDto {
    status?: ChannelTransferStatus;
}
export declare class QuerySupplyDemandTrendDto {
    startTime: string;
    endTime: string;
}
