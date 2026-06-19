import { PaymentMethod } from '../common/enums';
export declare class CreateWaterPriceSchemeDto {
    name: string;
    code: string;
    basePrice: number;
    tier1Multiplier?: number;
    tier2Threshold?: number;
    tier2Multiplier?: number;
    tier3Multiplier?: number;
    description?: string;
    isActive?: boolean;
}
export declare class UpdateWaterPriceSchemeDto {
    name?: string;
    basePrice?: number;
    tier1Multiplier?: number;
    tier2Threshold?: number;
    tier2Multiplier?: number;
    tier3Multiplier?: number;
    description?: string;
    isActive?: boolean;
}
export declare class BindChannelPriceSchemeDto {
    channelId: string;
    schemeId: string;
}
export declare class GenerateBillsDto {
    year: number;
    month: number;
}
export declare class GetFarmerBillDto {
    farmerId: string;
    year?: number;
    month?: number;
}
export declare class ChannelBillSummaryDto {
    year: number;
    month: number;
    channelId?: string;
}
export declare class PayWaterBillDto {
    billId: string;
    amount?: number;
    method?: PaymentMethod;
    remark?: string;
}
export declare class GetFarmerPaymentHistoryDto {
    farmerId: string;
}
