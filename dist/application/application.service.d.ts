import { PrismaService } from '../prisma/prisma.service';
import { QuotaService } from '../quota/quota.service';
import { WaterBillingService } from '../water-billing/water-billing.service';
import { RotationalIrrigationService } from '../rotational-irrigation/rotational-irrigation.service';
import { WaterRightsTradingService } from '../water-rights-trading/water-rights-trading.service';
import { CreditRatingService } from '../credit-rating/credit-rating.service';
import { CreateApplicationDto } from './dto';
export declare class ApplicationService {
    private prisma;
    private quotaService;
    private waterBillingService;
    private rotationalIrrigationService;
    private waterRightsTradingService;
    private creditRatingService;
    constructor(prisma: PrismaService, quotaService: QuotaService, waterBillingService: WaterBillingService, rotationalIrrigationService: RotationalIrrigationService, waterRightsTradingService: WaterRightsTradingService, creditRatingService: CreditRatingService);
    create(dto: CreateApplicationDto): Promise<{
        creditMultiplier: number;
        warnings: string[];
        roundName: string;
        farmer: {
            channel: {
                name: string;
                code: string;
                level: string;
                maxFlow: number;
                length: number;
                parentId: string | null;
                waterUtilizationCoefficient: number;
                id: string;
                propagationDelay: number;
                inspectionStatus: string;
                inspectionCycleDays: number;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            name: string;
            code: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            channelId: string;
            area: number;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        submitTime: Date;
        farmerId: string;
        expectedFlow: number;
        expectedHours: number;
        requestVolume: number;
        targetDate: Date;
        originalTargetDate: Date;
        status: string;
        failReason: string | null;
        conflictChannelId: string | null;
        conflictStartTime: Date | null;
        conflictEndTime: Date | null;
        postponeCount: number;
        roundId: string | null;
    }>;
    findAll(farmerId?: string, targetDate?: string, status?: string): Promise<({
        farmer: {
            channel: {
                name: string;
                code: string;
                id: string;
            };
            name: string;
            code: string;
            id: string;
        };
        actualUsage: {
            id: string;
            createdAt: Date;
            farmerId: string;
            applicationId: string;
            actualVolume: number;
            reportTime: Date;
            deviationRate: number;
            isOveruse: boolean;
            isWaste: boolean;
        };
        allocations: ({
            channel: {
                name: string;
                code: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            channelId: string;
            applicationId: string;
            startTime: Date;
            endTime: Date;
            flow: number;
            droughtStatus: string;
            originalFlow: number | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        submitTime: Date;
        farmerId: string;
        expectedFlow: number;
        expectedHours: number;
        requestVolume: number;
        targetDate: Date;
        originalTargetDate: Date;
        status: string;
        failReason: string | null;
        conflictChannelId: string | null;
        conflictStartTime: Date | null;
        conflictEndTime: Date | null;
        postponeCount: number;
        roundId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        farmer: {
            channel: {
                name: string;
                code: string;
                level: string;
                maxFlow: number;
                length: number;
                parentId: string | null;
                waterUtilizationCoefficient: number;
                id: string;
                propagationDelay: number;
                inspectionStatus: string;
                inspectionCycleDays: number;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            name: string;
            code: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            channelId: string;
            area: number;
        };
        actualUsage: {
            id: string;
            createdAt: Date;
            farmerId: string;
            applicationId: string;
            actualVolume: number;
            reportTime: Date;
            deviationRate: number;
            isOveruse: boolean;
            isWaste: boolean;
        };
        allocations: ({
            channel: {
                name: string;
                code: string;
                level: string;
                maxFlow: number;
                length: number;
                parentId: string | null;
                waterUtilizationCoefficient: number;
                id: string;
                propagationDelay: number;
                inspectionStatus: string;
                inspectionCycleDays: number;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            channelId: string;
            applicationId: string;
            startTime: Date;
            endTime: Date;
            flow: number;
            droughtStatus: string;
            originalFlow: number | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        submitTime: Date;
        farmerId: string;
        expectedFlow: number;
        expectedHours: number;
        requestVolume: number;
        targetDate: Date;
        originalTargetDate: Date;
        status: string;
        failReason: string | null;
        conflictChannelId: string | null;
        conflictStartTime: Date | null;
        conflictEndTime: Date | null;
        postponeCount: number;
        roundId: string | null;
    }>;
    getFarmerApplications(farmerId: string): Promise<({
        actualUsage: {
            id: string;
            createdAt: Date;
            farmerId: string;
            applicationId: string;
            actualVolume: number;
            reportTime: Date;
            deviationRate: number;
            isOveruse: boolean;
            isWaste: boolean;
        };
        allocations: ({
            channel: {
                name: string;
                code: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            channelId: string;
            applicationId: string;
            startTime: Date;
            endTime: Date;
            flow: number;
            droughtStatus: string;
            originalFlow: number | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        submitTime: Date;
        farmerId: string;
        expectedFlow: number;
        expectedHours: number;
        requestVolume: number;
        targetDate: Date;
        originalTargetDate: Date;
        status: string;
        failReason: string | null;
        conflictChannelId: string | null;
        conflictStartTime: Date | null;
        conflictEndTime: Date | null;
        postponeCount: number;
        roundId: string | null;
    })[]>;
    cancel(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        submitTime: Date;
        farmerId: string;
        expectedFlow: number;
        expectedHours: number;
        requestVolume: number;
        targetDate: Date;
        originalTargetDate: Date;
        status: string;
        failReason: string | null;
        conflictChannelId: string | null;
        conflictStartTime: Date | null;
        conflictEndTime: Date | null;
        postponeCount: number;
        roundId: string | null;
    }>;
}
