import { DisputeMediationService } from './dispute-mediation.service';
import { CreateDisputeDto, AcceptDisputeDto, AddMediationRecordDto, CloseDisputeDto, QueryDisputesDto, QuarterlyStatsDto } from './dto';
import { DisputeType } from '../common/enums';
export declare class DisputeMediationController {
    private readonly service;
    constructor(service: DisputeMediationService);
    create(dto: CreateDisputeDto): Promise<{
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
    findAll(dto: QueryDisputesDto): Promise<{
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
    }>;
    findOne(id: string): Promise<{
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
    accept(id: string, dto: AcceptDisputeDto): Promise<{
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
    close(id: string, dto: CloseDisputeDto): Promise<{
        id: string;
        disputeNo: string;
        status: string;
        statusName: string;
        result: string;
        resultName: string;
        resultNote: string;
        closedAt: Date;
    }>;
    reopen(id: string): Promise<{
        id: string;
        disputeNo: string;
        status: string;
        statusName: string;
    }>;
    archive(id: string): Promise<{
        id: string;
        disputeNo: string;
        status: string;
        statusName: string;
        archivedAt: Date;
    }>;
}
