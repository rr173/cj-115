import { CreditRatingService } from './credit-rating.service';
import { AdjustCreditScoreDto } from './dto';
export declare class CreditRatingController {
    private readonly service;
    constructor(service: CreditRatingService);
    getFarmerCredit(farmerId: string): Promise<{
        farmer: {
            id: string;
            code: string;
            name: string;
        };
        score: number;
        level: string;
        levelName: string;
        factors: {
            baseCredit: {
                score: number;
                maxScore: number;
                description: string;
            };
            paymentTimeliness: {
                score: number;
                maxScore: number;
                description: string;
            };
            usageDeviation: {
                score: number;
                maxScore: number;
                description: string;
            };
            overuseRecord: {
                score: number;
                maxScore: number;
                description: string;
            };
            tradingActivity: {
                score: number;
                maxScore: number;
                description: string;
            };
        };
        hasUnpaidDebt: boolean;
        debtPenalty: number;
        lastCalcAt: Date;
    }>;
    getCreditRanking(): Promise<{
        total: number;
        ranking: any[];
    }>;
    adjustCreditScore(farmerId: string, dto: AdjustCreditScoreDto): Promise<{
        farmerId: string;
        previousScore: number;
        newScore: any;
        previousLevel: string;
        newLevel: any;
        newLevelName: string;
        adjustScore: number;
        reason: string;
        operator: string;
    }>;
    getCreditHistory(farmerId: string, page?: string, pageSize?: string): Promise<{
        farmer: {
            id: string;
            code: string;
            name: string;
        };
        total: number;
        page: number;
        pageSize: number;
        records: {
            id: string;
            type: string;
            typeName: string;
            previousScore: number;
            newScore: number;
            scoreChange: number;
            previousLevel: string;
            newLevel: string;
            factors: {
                baseScore: number;
                paymentScore: number;
                deviationScore: number;
                overuseScore: number;
                tradingScore: number;
            };
            hasUnpaidDebt: boolean;
            debtPenalty: number;
            reason: string;
            operator: string;
            createdAt: Date;
        }[];
    }>;
    triggerRecalculate(): Promise<{
        totalProcessed: number;
        results: any[];
    }>;
}
