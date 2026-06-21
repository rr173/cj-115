import { PrismaService } from '../prisma/prisma.service';
import { CreditLevel } from '../common/enums';
import { AdjustCreditScoreDto, GetCreditHistoryDto } from './dto';
export declare class CreditRatingService {
    private prisma;
    constructor(prisma: PrismaService);
    ensureFarmerCredit(farmerId: string): Promise<{
        level: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        farmerId: string;
        score: number;
        baseScore: number;
        paymentScore: number;
        deviationScore: number;
        overuseScore: number;
        tradingScore: number;
        hasUnpaidDebt: boolean;
        debtPenalty: number;
        lastCalcAt: Date | null;
    }>;
    getFarmerCreditDetail(farmerId: string): Promise<{
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
        newScore: number;
        previousLevel: string;
        newLevel: string;
        newLevelName: string;
        adjustScore: number;
        reason: string;
        operator: string;
    }>;
    getCreditHistory(dto: GetCreditHistoryDto): Promise<{
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
    recalculateAll(): Promise<{
        totalProcessed: number;
        results: any[];
    }>;
    recalculateFarmerScore(farmerId: string): Promise<{
        farmerId: string;
        previousScore: number;
        newScore: number;
        previousLevel: string;
        newLevel: CreditLevel;
        newLevelName: string;
        factors: {
            baseScore: number;
            paymentScore: number;
            deviationScore: number;
            overuseScore: number;
            tradingScore: number;
        };
        hasUnpaidDebt: boolean;
        debtPenalty: number;
    }>;
    private calcPaymentScore;
    private calcDeviationScore;
    private calcOveruseScore;
    private calcTradingScore;
    private checkUnpaidDebt;
    getFarmerCreditLevel(farmerId: string): Promise<CreditLevel>;
    getFarmerCreditLevelMap(farmerIds: string[]): Promise<Map<string, CreditLevel>>;
    checkDFarmerCanApply(farmerId: string): Promise<{
        canApply: boolean;
        reason?: string;
    }>;
    getQuotaMultiplier(farmerId: string): Promise<number>;
    handleMonthlyCreditRecalc(): Promise<void>;
}
