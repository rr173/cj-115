export declare class CreateDisputeDto {
    type: string;
    farmerIds: string[];
    description: string;
    occurredAt: string;
    applicationIds?: string[];
}
export declare class AcceptDisputeDto {
    mediatorName: string;
    expectedDays: number;
}
export declare class AddMediationRecordDto {
    recorderName: string;
    content: string;
    isOnSiteInspection?: boolean;
}
export declare class CloseDisputeDto {
    result: string;
    resultNote: string;
}
export declare class QueryDisputesDto {
    startDate?: string;
    endDate?: string;
    type?: string;
    status?: string;
    isOverdue?: boolean;
    page?: number;
    pageSize?: number;
}
export declare class QuarterlyStatsDto {
    year: number;
    quarter: string;
}
