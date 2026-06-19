import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod } from '../common/enums';
import { CreateWaterPriceSchemeDto, UpdateWaterPriceSchemeDto, BindChannelPriceSchemeDto, GenerateBillsDto, GetFarmerBillDto, ChannelBillSummaryDto, PayWaterBillDto, GetFarmerPaymentHistoryDto } from './dto';
export declare class WaterBillingService {
    private prisma;
    constructor(prisma: PrismaService);
    createScheme(dto: CreateWaterPriceSchemeDto): Promise<{
        name: string;
        description: string | null;
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        basePrice: number;
        tier1Multiplier: number;
        tier2Threshold: number;
        tier2Multiplier: number;
        tier3Multiplier: number;
        isActive: boolean;
    }>;
    updateScheme(id: string, dto: UpdateWaterPriceSchemeDto): Promise<{
        name: string;
        description: string | null;
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        basePrice: number;
        tier1Multiplier: number;
        tier2Threshold: number;
        tier2Multiplier: number;
        tier3Multiplier: number;
        isActive: boolean;
    }>;
    listSchemes(): Promise<({
        channelBindings: ({
            channel: {
                name: string;
                code: string;
                level: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            channelId: string;
            schemeId: string;
        })[];
    } & {
        name: string;
        description: string | null;
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        basePrice: number;
        tier1Multiplier: number;
        tier2Threshold: number;
        tier2Multiplier: number;
        tier3Multiplier: number;
        isActive: boolean;
    })[]>;
    getScheme(id: string): Promise<{
        channelBindings: ({
            channel: {
                name: string;
                code: string;
                level: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            channelId: string;
            schemeId: string;
        })[];
    } & {
        name: string;
        description: string | null;
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        basePrice: number;
        tier1Multiplier: number;
        tier2Threshold: number;
        tier2Multiplier: number;
        tier3Multiplier: number;
        isActive: boolean;
    }>;
    deleteScheme(id: string): Promise<{
        name: string;
        description: string | null;
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        basePrice: number;
        tier1Multiplier: number;
        tier2Threshold: number;
        tier2Multiplier: number;
        tier3Multiplier: number;
        isActive: boolean;
    }>;
    bindChannelPriceScheme(dto: BindChannelPriceSchemeDto): Promise<{
        id: string;
        createdAt: Date;
        channelId: string;
        schemeId: string;
    }>;
    unbindChannelPriceScheme(channelId: string): Promise<{
        id: string;
        createdAt: Date;
        channelId: string;
        schemeId: string;
    }>;
    findApplicableSchemeForFarmer(farmerId: string): Promise<{
        scheme: any;
        channel: any;
    } | null>;
    getMonthQuotaVolume(farmerId: string, year: number, month: number): Promise<number>;
    calculateMonthWaterUsage(farmerId: string, year: number, month: number): Promise<{
        totalVolume: number;
        details: {
            applicationId: string;
            actualVolume: number;
            estimated: boolean;
            plannedVolume: number;
        }[];
    }>;
    calculateTieredPricing(totalVolume: number, quotaVolume: number, scheme: any): {
        tier1Volume: number;
        tier1Amount: number;
        tier2Volume: number;
        tier2Amount: number;
        tier3Volume: number;
        tier3Amount: number;
        baseAmount: number;
        tierDetails: any[];
    };
    calculateSubsidy(totalVolume: number, quotaVolume: number, scheme: any): {
        subsidyAmount: number;
        subsidyVolume: number;
    };
    generateMonthlyBills(dto: GenerateBillsDto): Promise<{
        year: number;
        month: number;
        totalFarmers: number;
        successCount: number;
        skipCount: number;
        bills: any[];
    }>;
    ensureFarmerAccount(farmerId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        farmerId: string;
        isFrozen: boolean;
        freezeReason: string | null;
        frozenAt: Date | null;
        lastOverdueMonths: number;
    }>;
    getFarmerBills(dto: GetFarmerBillDto): Promise<{
        id: any;
        farmer: {
            id: any;
            code: any;
            name: any;
        };
        scheme: {
            id: any;
            name: any;
            code: any;
            basePrice: any;
        };
        billingPeriod: string;
        billingYear: any;
        billingMonth: any;
        quotaVolume: any;
        totalVolume: any;
        tierBreakdown: any;
        tierSummary: {
            tier1: {
                volume: any;
                amount: any;
            };
            tier2: {
                volume: any;
                amount: any;
            };
            tier3: {
                volume: any;
                amount: any;
            };
        };
        baseAmount: any;
        subsidy: {
            amount: any;
            volume: any;
            description: string;
        };
        lateFee: any;
        totalAmount: any;
        paidAmount: any;
        remainingAmount: any;
        status: any;
        statusName: any;
        dueDate: any;
        generatedAt: any;
        payments: any;
    }[]>;
    getBillDetail(billId: string): Promise<{
        id: any;
        farmer: {
            id: any;
            code: any;
            name: any;
        };
        scheme: {
            id: any;
            name: any;
            code: any;
            basePrice: any;
        };
        billingPeriod: string;
        billingYear: any;
        billingMonth: any;
        quotaVolume: any;
        totalVolume: any;
        tierBreakdown: any;
        tierSummary: {
            tier1: {
                volume: any;
                amount: any;
            };
            tier2: {
                volume: any;
                amount: any;
            };
            tier3: {
                volume: any;
                amount: any;
            };
        };
        baseAmount: any;
        subsidy: {
            amount: any;
            volume: any;
            description: string;
        };
        lateFee: any;
        totalAmount: any;
        paidAmount: any;
        remainingAmount: any;
        status: any;
        statusName: any;
        dueDate: any;
        generatedAt: any;
        payments: any;
    }>;
    private formatBillDetail;
    getChannelBillSummary(dto: ChannelBillSummaryDto): Promise<{
        year: number;
        month: number;
        totalSummary: {
            farmerCount: number;
            totalVolume: number;
            baseAmount: number;
            subsidyAmount: number;
            lateFeeAmount: number;
            totalAmount: number;
            paidAmount: number;
            remainingAmount: number;
            unpaidCount: number;
            overdueCount: number;
            paidCount: number;
        };
        channelBreakdown: {
            totalVolume: number;
            baseAmount: number;
            subsidyAmount: number;
            lateFeeAmount: number;
            totalAmount: number;
            paidAmount: number;
            remainingAmount: number;
            channelId: string;
            channelCode: string;
            channelName: string;
            farmerCount: number;
            unpaidCount: number;
            overdueCount: number;
        }[];
    }>;
    private getAllChannelDescendants;
    payWaterBill(dto: PayWaterBillDto): Promise<{
        billId: string;
        farmer: {
            id: string;
            name: any;
        };
        billingPeriod: string;
        payAmount: number;
        paymentMethod: PaymentMethod;
        paidAmount: number;
        remainingAmount: number;
        status: string;
        isFullyPaid: boolean;
        paymentId: string;
        accountStatus: {
            isFrozen: boolean;
            freezeReason: string;
        };
    }>;
    getFarmerPaymentHistory(dto: GetFarmerPaymentHistoryDto): Promise<{
        farmer: {
            id: string;
            code: string;
            name: string;
        };
        totalPaymentCount: number;
        totalPaymentAmount: number;
        payments: {
            id: string;
            billId: string;
            billingPeriod: string;
            billTotalAmount: number;
            billStatus: string;
            amount: number;
            method: string;
            paidAt: Date;
            remark: string;
        }[];
    }>;
    getFarmerDebtStatus(farmerId: string): Promise<{
        farmer: {
            id: string;
            code: string;
            name: string;
        };
        account: {
            isFrozen: boolean;
            freezeReason: string;
            frozenAt: Date;
            overdueMonths: number;
        };
        debtSummary: {
            unpaidBillCount: number;
            overdueBillCount: number;
            totalRemainingAmount: number;
            totalLateFeeAmount: number;
        };
        unpaidBills: {
            id: string;
            billingPeriod: string;
            totalAmount: number;
            paidAmount: number;
            remainingAmount: number;
            lateFee: number;
            status: string;
            dueDate: Date;
        }[];
    }>;
    checkFarmerCanApply(farmerId: string): Promise<{
        canApply: boolean;
        reason?: string;
    }>;
    private updateSingleBillOverdue;
    private updateBillOverdueStatus;
    private checkAndUpdateFreezeStatus;
    private checkAndUpdateFreezeStatusInTx;
    handleMonthlyBillingCron(): Promise<void>;
    handleOverdueCheckCron(): Promise<void>;
}
