import { PrismaService } from '../prisma/prisma.service';
import { ChannelService } from '../channel/channel.service';
import { CreditRatingService } from '../credit-rating/credit-rating.service';
import { QuotaQuarter } from '../common/enums';
import { UpdateChannelCoefficientDto, QueryFarmerEfficiencyHistoryDto, TriggerAssessmentDto } from './dto';
export declare class IrrigationEfficiencyService {
    private prisma;
    private channelService;
    private creditRatingService;
    constructor(prisma: PrismaService, channelService: ChannelService, creditRatingService: CreditRatingService);
    getChannelCoefficient(channelId: string): Promise<{
        channel: {
            id: string;
            code: string;
            name: string;
            level: string;
        };
        waterUtilizationCoefficient: number;
        compositeUtilizationCoefficient: number;
        pathDetail: {
            id: string;
            code: string;
            level: import("../common/enums").ChannelLevel;
            coefficient: number;
        }[];
    }>;
    updateChannelCoefficient(channelId: string, dto: UpdateChannelCoefficientDto): Promise<{
        channelId: string;
        code: string;
        name: string;
        previousCoefficient: number;
        newCoefficient: number;
    }>;
    calculateEfficiencyForApplication(applicationId: string): Promise<{
        applicationId: string;
        farmer: {
            id: string;
            code: string;
            name: string;
        };
        channel: {
            id: string;
            code: string;
            name: string;
        };
        plannedVolume: number;
        theoreticalLossVolume: number;
        theoreticalFieldVolume: number;
        actualUsageVolume: number;
        efficiencyDeviationRate: number;
        compositeUtilizationCoefficient: number;
        pathDetail: {
            id: string;
            code: string;
            level: import("../common/enums").ChannelLevel;
            coefficient: number;
        }[];
    }>;
    getAllocationEfficiencyDetail(applicationId: string): Promise<{
        applicationId: string;
        farmer: {
            id: string;
            code: string;
            name: string;
        };
        channel: {
            id: string;
            code: string;
            name: string;
        };
        plannedVolume: number;
        theoreticalLossVolume: number;
        theoreticalFieldVolume: number;
        actualUsageVolume: number;
        efficiencyDeviationRate: number;
        compositeUtilizationCoefficient: number;
        pathDetail: {
            id: string;
            code: string;
            level: import("../common/enums").ChannelLevel;
            coefficient: number;
        }[];
    } | {
        applicationId: string;
        farmer: {
            id: string;
            code: string;
            name: string;
        };
        channel: {
            id: string;
            code: string;
            name: string;
            level: string;
        };
        plannedVolume: number;
        theoreticalLossVolume: number;
        theoreticalFieldVolume: number;
        actualUsageVolume: number;
        efficiencyDeviationRate: number;
        compositeUtilizationCoefficient: number;
        createdAt: Date;
    }>;
    getFarmerEfficiencyHistory(dto: QueryFarmerEfficiencyHistoryDto): Promise<{
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
            applicationId: string;
            targetDate: string;
            channel: {
                id: string;
                code: string;
                name: string;
            };
            plannedVolume: number;
            theoreticalLossVolume: number;
            theoreticalFieldVolume: number;
            actualUsageVolume: number;
            efficiencyDeviationRate: number;
            compositeUtilizationCoefficient: number;
            createdAt: Date;
        }[];
    }>;
    triggerQuarterlyAssessment(dto: TriggerAssessmentDto): Promise<{
        reportId: string;
        year: number;
        quarter: QuotaQuarter;
        channelAssessmentCount: number;
        channelUnqualifiedCount: number;
        farmerAssessmentCount: number;
        farmerUnqualifiedCount: number;
        channelAssessments: any[];
        farmerAssessments: any[];
    }>;
    private buildChannelAssessments;
    private buildFarmerAssessments;
    getQuarterlyAssessment(year: number, quarter: string): Promise<{
        reportId: string;
        year: number;
        quarter: string;
        createdAt: Date;
        channelAssessments: {
            channel: {
                id: string;
                code: string;
                name: string;
                level: string;
            };
            configuredCoefficient: number;
            actualLossRate: number;
            deviation: number;
            assessmentStatus: string;
            assessmentStatusName: string;
            suggestion: string;
        }[];
        farmerAssessments: {
            farmer: {
                id: string;
                code: string;
                name: string;
            };
            averageDeviationRate: number;
            assessmentStatus: string;
            assessmentStatusName: string;
            creditScoreDeducted: boolean;
        }[];
    }>;
}
