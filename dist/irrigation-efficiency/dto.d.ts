import { QuotaQuarter } from '../common/enums';
export declare class UpdateChannelCoefficientDto {
    coefficient: number;
}
export declare class QueryFarmerEfficiencyHistoryDto {
    farmerId: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
}
export declare class TriggerAssessmentDto {
    year: number;
    quarter: QuotaQuarter;
}
export declare class GetAssessmentDto {
    year: number;
    quarter: QuotaQuarter;
}
