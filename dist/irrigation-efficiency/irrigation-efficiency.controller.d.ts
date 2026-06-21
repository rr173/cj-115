import { IrrigationEfficiencyService } from './irrigation-efficiency.service';
import { UpdateChannelCoefficientDto, TriggerAssessmentDto } from './dto';
import { QuotaQuarter } from '../common/enums';
export declare class IrrigationEfficiencyController {
    private readonly service;
    constructor(service: IrrigationEfficiencyService);
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
    getAllocationEfficiency(applicationId: string): Promise<{
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
    getFarmerEfficiencyHistory(farmerId: string, dateFrom?: string, dateTo?: string, page?: string, pageSize?: string): Promise<{
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
    getQuarterlyAssessment(year: string, quarter: string): Promise<{
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
    triggerAssessment(dto: TriggerAssessmentDto): Promise<{
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
}
