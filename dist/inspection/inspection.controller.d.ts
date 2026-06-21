import { InspectionService } from './inspection.service';
import { CreateInspectionDto, CreateMaintenanceOrderDto } from './dto';
export declare class InspectionController {
    private readonly service;
    constructor(service: InspectionService);
    createInspection(dto: CreateInspectionDto): Promise<{
        channel: {
            name: string;
            code: string;
            id: string;
        };
    } & {
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        channelId: string;
        inspectorName: string;
        inspectionDate: Date;
        problemLevel: string;
        leakageRate: number | null;
        siltDepth: number | null;
        liningDamageLength: number | null;
    }>;
    findInspections(channelId?: string, startDate?: string, endDate?: string): Promise<({
        channel: {
            name: string;
            code: string;
            level: string;
            id: string;
        };
    } & {
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        channelId: string;
        inspectorName: string;
        inspectionDate: Date;
        problemLevel: string;
        leakageRate: number | null;
        siltDepth: number | null;
        liningDamageLength: number | null;
    })[]>;
    getChannelInspectionHistory(channelId: string): Promise<{
        channel: {
            id: string;
            code: string;
            name: string;
            inspectionStatus: string;
            inspectionCycleDays: number;
        };
        records: ({
            channel: {
                name: string;
                code: string;
                id: string;
            };
        } & {
            description: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            channelId: string;
            inspectorName: string;
            inspectionDate: Date;
            problemLevel: string;
            leakageRate: number | null;
            siltDepth: number | null;
            liningDamageLength: number | null;
        })[];
    }>;
    getInspectionStatistics(channelId: string, startDate: string, endDate: string): Promise<{
        channelId: string;
        channelName: string;
        period: {
            startDate: string;
            endDate: string;
        };
        totalRecords: number;
        distribution: Record<string, number>;
    }>;
    getOverdueChannels(): Promise<any[]>;
    createMaintenanceOrder(dto: CreateMaintenanceOrderDto): Promise<{
        channel: {
            name: string;
            code: string;
            level: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        channelId: string;
        status: string;
        planStartDate: Date;
        estimatedDurationDays: number;
        crewCode: string;
        stopWaterStart: Date;
        stopWaterEnd: Date;
        approvedAt: Date | null;
        startedAt: Date | null;
        acceptedAt: Date | null;
        closedAt: Date | null;
        impactAnalysis: string | null;
    }>;
    findMaintenanceOrders(status?: string, channelId?: string): Promise<({
        channel: {
            name: string;
            code: string;
            level: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        channelId: string;
        status: string;
        planStartDate: Date;
        estimatedDurationDays: number;
        crewCode: string;
        stopWaterStart: Date;
        stopWaterEnd: Date;
        approvedAt: Date | null;
        startedAt: Date | null;
        acceptedAt: Date | null;
        closedAt: Date | null;
        impactAnalysis: string | null;
    })[]>;
    findOneMaintenanceOrder(id: string): Promise<{
        channel: {
            name: string;
            code: string;
            level: string;
            id: string;
            inspectionStatus: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        channelId: string;
        status: string;
        planStartDate: Date;
        estimatedDurationDays: number;
        crewCode: string;
        stopWaterStart: Date;
        stopWaterEnd: Date;
        approvedAt: Date | null;
        startedAt: Date | null;
        acceptedAt: Date | null;
        closedAt: Date | null;
        impactAnalysis: string | null;
    }>;
    approveMaintenanceOrder(id: string): Promise<{
        order: {
            channel: {
                name: string;
                code: string;
                level: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            channelId: string;
            status: string;
            planStartDate: Date;
            estimatedDurationDays: number;
            crewCode: string;
            stopWaterStart: Date;
            stopWaterEnd: Date;
            approvedAt: Date | null;
            startedAt: Date | null;
            acceptedAt: Date | null;
            closedAt: Date | null;
            impactAnalysis: string | null;
        };
        impactAnalysis: {
            affectedChannelCount: number;
            affectedChannelIds: string[];
            affectedFarmerCount: number;
            totalAffectedArea: number;
            affectedApplicationCount: number;
            affectedApplications: {
                id: string;
                farmerCode: string;
                farmerName: string;
                channelCode: string;
                channelName: string;
                targetDate: Date;
                requestVolume: number;
                status: string;
                action: string;
            }[];
        };
    }>;
    startMaintenanceOrder(id: string): Promise<{
        channel: {
            name: string;
            code: string;
            level: string;
            id: string;
            inspectionStatus: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        channelId: string;
        status: string;
        planStartDate: Date;
        estimatedDurationDays: number;
        crewCode: string;
        stopWaterStart: Date;
        stopWaterEnd: Date;
        approvedAt: Date | null;
        startedAt: Date | null;
        acceptedAt: Date | null;
        closedAt: Date | null;
        impactAnalysis: string | null;
    }>;
    acceptMaintenanceOrder(id: string): Promise<{
        channel: {
            name: string;
            code: string;
            level: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        channelId: string;
        status: string;
        planStartDate: Date;
        estimatedDurationDays: number;
        crewCode: string;
        stopWaterStart: Date;
        stopWaterEnd: Date;
        approvedAt: Date | null;
        startedAt: Date | null;
        acceptedAt: Date | null;
        closedAt: Date | null;
        impactAnalysis: string | null;
    }>;
    closeMaintenanceOrder(id: string): Promise<{
        channel: {
            name: string;
            code: string;
            level: string;
            id: string;
            inspectionStatus: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        channelId: string;
        status: string;
        planStartDate: Date;
        estimatedDurationDays: number;
        crewCode: string;
        stopWaterStart: Date;
        stopWaterEnd: Date;
        approvedAt: Date | null;
        startedAt: Date | null;
        acceptedAt: Date | null;
        closedAt: Date | null;
        impactAnalysis: string | null;
    }>;
    getStopWaterSchedule(startDate: string, endDate: string): Promise<{
        period: {
            startDate: string;
            endDate: string;
        };
        totalOrders: number;
        byDate: Record<string, any[]>;
        orders: {
            id: string;
            channel: {
                name: string;
                code: string;
                level: string;
                parentId: string;
                id: string;
            };
            planStartDate: Date;
            estimatedDurationDays: number;
            stopWaterStart: Date;
            stopWaterEnd: Date;
            status: string;
            crewCode: string;
        }[];
    }>;
    resetChannelInspectionStatus(channelId: string): Promise<{
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
    }>;
}
