import { WaterRightsTradingService } from './water-rights-trading.service';
import { CreateSellOrderDto, BuySellOrderDto, GetMarketSellOrdersDto, GetTradeHistoryDto, GetWaterRightsAccountDto } from './dto';
import { QuotaQuarter } from '../common/enums';
export declare class WaterRightsTradingController {
    private readonly service;
    constructor(service: WaterRightsTradingService);
    createSellOrder(dto: CreateSellOrderDto): Promise<{
        statusName: string;
        expiresIn: string;
        seller: {
            name: string;
            code: string;
            id: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        quarter: string;
        year: number;
        unitPrice: number;
        sellerId: string;
        sellVolume: number;
        remainingVolume: number;
        expiresAt: Date;
    }>;
    buySellOrder(dto: BuySellOrderDto): Promise<{
        tradeId: string;
        sellOrderId: string;
        buyer: {
            name: string;
            code: string;
            id: string;
        };
        seller: {
            name: string;
            code: string;
            id: string;
        };
        volume: number;
        unitPrice: number;
        totalAmount: number;
        year: number;
        quarter: string;
        createdAt: Date;
    }>;
    cancelSellOrder(sellOrderId: string): Promise<{
        message: string;
        unfreezeVolume: number;
    }>;
    getMarketSellOrders(dto: GetMarketSellOrdersDto): Promise<{
        id: string;
        seller: {
            name: string;
            code: string;
            id: string;
        };
        year: number;
        quarter: string;
        sellVolume: number;
        remainingVolume: number;
        unitPrice: number;
        status: string;
        statusName: string;
        createdAt: Date;
        expiresAt: Date;
    }[]>;
    getTradeHistory(dto: GetTradeHistoryDto): Promise<{
        farmer: {
            id: string;
            code: string;
            name: string;
        };
        buyHistory: {
            id: string;
            sellOrderId: string;
            counterparty: {
                name: string;
                code: string;
                id: string;
            };
            direction: string;
            year: number;
            quarter: string;
            volume: number;
            unitPrice: number;
            totalAmount: number;
            createdAt: Date;
        }[];
        sellHistory: {
            id: string;
            sellOrderId: string;
            counterparty: {
                name: string;
                code: string;
                id: string;
            };
            direction: string;
            year: number;
            quarter: string;
            volume: number;
            unitPrice: number;
            totalAmount: number;
            createdAt: Date;
        }[];
    }>;
    getWaterRightsAccount(dto: GetWaterRightsAccountDto): Promise<{
        farmer: {
            id: string;
            code: string;
            name: string;
        };
        year: number;
        quarter: QuotaQuarter;
        initialQuota: number;
        boughtVolume: number;
        soldVolume: number;
        usedVolume: number;
        frozenVolume: number;
        availableVolume: number;
        accountCreated: boolean;
    }>;
    expireOldOrders(): Promise<{
        expiredCount: number;
    }>;
}
