import { QuotaQuarter } from '../common/enums';
export declare class CreateSellOrderDto {
    sellerId: string;
    year: number;
    quarter: QuotaQuarter;
    sellVolume: number;
    unitPrice: number;
}
export declare class BuySellOrderDto {
    sellOrderId: string;
    buyerId: string;
    buyVolume: number;
}
export declare class CancelSellOrderDto {
    sellOrderId: string;
}
export declare class GetMarketSellOrdersDto {
    year?: number;
    quarter?: QuotaQuarter;
}
export declare class GetTradeHistoryDto {
    farmerId: string;
}
export declare class GetWaterRightsAccountDto {
    farmerId: string;
    year: number;
    quarter: QuotaQuarter;
}
