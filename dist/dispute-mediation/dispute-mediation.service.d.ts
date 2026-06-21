import { PrismaService } from '../prisma/prisma.service';
import { CreditRatingService } from '../credit-rating/credit-rating.service';
import { DisputeType } from '../common/enums';
import { CreateDisputeDto, AcceptDisputeDto, AddMediationRecordDto, CloseDisputeDto, QueryDisputesDto, QuarterlyStatsDto } from './dto';
export declare class DisputeMediationService {
    private prisma;
    private creditRatingService;
    constructor(prisma: PrismaService, creditRatingService: CreditRatingService);
    private generateDisputeNo;
    createDispute(dto: CreateDisputeDto): Promise<{
        id: string;
        disputeNo: string;
        type: string;
        typeName: string;
        description: string;
        occurredAt: Date;
        status: string;
        statusName: string;
        farmerIds: string[];
        applicationIds: string[];
        createdAt: Date;
    }>;
    acceptDispute(id: string, dto: AcceptDisputeDto): Promise<{
        id: string;
        disputeNo: string;
        status: string;
        statusName: string;
        mediatorName: string;
        expectedDays: number;
        acceptedAt: Date;
    }>;
    addMediationRecord(id: string, dto: AddMediationRecordDto): Promise<{
        id: string;
        disputeId: string;
        recordedAt: Date;
        recorderName: string;
        content: string;
        isOnSiteInspection: boolean;
        createdAt: Date;
    }>;
    closeDispute(id: string, dto: CloseDisputeDto): Promise<{
        id: string;
        disputeNo: string;
        status: string;
        statusName: string;
        result: string;
        resultName: string;
        resultNote: string;
        closedAt: Date;
    }>;
    reopenDispute(id: string): Promise<{
        id: string;
        disputeNo: string;
        status: string;
        statusName: string;
    }>;
    archiveDispute(id: string): Promise<{
        id: string;
        disputeNo: string;
        status: string;
        statusName: string;
        archivedAt: Date;
    }>;
    private isOverdue;
    queryDisputes(dto: QueryDisputesDto): Promise<{
        total: number;
        page: number;
        pageSize: number;
        items: {
            id: string;
            disputeNo: string;
            type: string;
            typeName: string;
            description: string;
            occurredAt: Date;
            status: string;
            statusName: string;
            isOverdue: boolean;
            mediatorName: string;
            expectedDays: number;
            acceptedAt: Date;
            closedAt: Date;
            result: string;
            resultName: string;
            resultNote: string;
            farmers: {
                name: string;
                code: string;
                id: string;
            }[];
            applications: {
                id: string;
                targetDate: Date;
                status: string;
            }[];
            mediationRecordCount: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    getDisputeDetail(id: string): Promise<{
        id: string;
        disputeNo: string;
        type: string;
        typeName: string;
        description: string;
        occurredAt: Date;
        status: string;
        statusName: string;
        isOverdue: boolean;
        mediatorName: string;
        expectedDays: number;
        acceptedAt: Date;
        closedAt: Date;
        archivedAt: Date;
        result: string;
        resultName: string;
        resultNote: string;
        farmers: {
            name: string;
            code: string;
            id: string;
            channelId: string;
        }[];
        applications: {
            id: string;
            createdAt: Date;
            farmerId: string;
            expectedFlow: number;
            expectedHours: number;
            requestVolume: number;
            targetDate: Date;
            status: string;
        }[];
        mediationTimeline: {
            id: string;
            recordedAt: Date;
            recorderName: string;
            content: string;
            isOnSiteInspection: boolean;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    getFarmerDisputes(farmerId: string): Promise<{
        farmer: {
            id: string;
            code: string;
            name: string;
        };
        total: number;
        disputes: {
            id: string;
            disputeNo: string;
            type: string;
            typeName: string;
            description: string;
            occurredAt: Date;
            status: string;
            statusName: string;
            isOverdue: boolean;
            result: string;
            resultName: string;
            otherFarmers: {
                name: string;
                code: string;
                id: string;
            }[];
            mediationRecordCount: number;
            createdAt: Date;
        }[];
    }>;
    getQuarterlyStats(dto: QuarterlyStatsDto): Promise<{
        year: number;
        quarter: string;
        quarterName: string;
        totalDisputes: number;
        totalAvgProcessingDays: number;
        typeStats: {
            type: DisputeType;
            typeName: string;
            count: number;
            avgProcessingDays: number;
        }[];
        creditPenalty: {
            totalChecked: number;
            penalizedCount: number;
            details: any[];
        };
    }>;
    private hasQuarterlyDisputePenalty;
    private applyPenaltyForFarmerInQuarter;
    private applyQuarterlyCreditPenalty;
    private checkAndApplyCreditPenalty;
    triggerQuarterlyCreditPenalty(year: number, quarter: string): Promise<{
        totalChecked: number;
        penalizedCount: number;
        details: any[];
    }>;
    triggerAllQuarterlyCreditPenalty(): Promise<{
        year: number;
        quarterResults: any[];
    }>;
    handleAutoArchive(): Promise<void>;
}
