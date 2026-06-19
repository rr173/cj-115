import { PrismaService } from '../prisma/prisma.service';
import { WaterBillingService } from '../water-billing/water-billing.service';
import { QuotaService } from '../quota/quota.service';
import { QuotaQuarter } from '../common/enums';
import { CreateSellOrderDto, BuySellOrderDto, GetMarketSellOrdersDto, GetTradeHistoryDto, GetWaterRightsAccountDto } from './dto';
export declare class WaterRightsTradingService {
    private prisma;
    private waterBillingService;
    private quotaService;
    constructor(prisma: PrismaService, waterBillingService: WaterBillingService, quotaService: QuotaService);
    ensureWaterRightsAccount(farmerId: string, year: number, quarter: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        farmerId: string;
        quarter: string;
        year: number;
        initialQuota: number;
        boughtVolume: number;
        soldVolume: number;
        usedVolume: number;
        frozenVolume: number;
    }>;
    getAvailableQuota(farmerId: string, year: number, quarter: string): Promise<number>;
    calculateUsedVolume(farmerId: string, year: number, quarter: string): Promise<number>;
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
    getWaterRightsAccountDetail(dto: GetWaterRightsAccountDto): Promise<{
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
    handleExpireOrdersCron(): Promise<void>;
}
