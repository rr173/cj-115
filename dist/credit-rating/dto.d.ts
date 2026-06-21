export declare class AdjustCreditScoreDto {
    adjustScore: number;
    reason: string;
    operator?: string;
}
export declare class GetCreditHistoryDto {
    farmerId: string;
    page?: number;
    pageSize?: number;
}
