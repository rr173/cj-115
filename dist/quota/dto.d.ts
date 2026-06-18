import { QuotaQuarter } from '../common/enums';
export declare class SetQuotaDto {
    farmerId: string;
    quarter: QuotaQuarter;
    year: number;
    amount: number;
}
export declare class BatchSetQuotaDto {
    items: SetQuotaDto[];
}
