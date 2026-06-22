import { SchedulingService } from './scheduling.service';
import { AutoSchedulingService } from './auto-scheduling.service';
export declare class SchedulingController {
    private readonly service;
    private readonly autoService;
    constructor(service: SchedulingService, autoService: AutoSchedulingService);
    runScheduling(date: string): Promise<{
        targetDate: string;
        totalProcessed: number;
        scheduled: number;
        failed: number;
        emergencyScheduled: number;
        emergencyFailed: number;
        details: any[];
    }>;
    triggerAutoScheduling(date?: string): Promise<{
        targetDate: string;
        totalProcessed: number;
        scheduled: number;
        failed: number;
        emergencyScheduled: number;
        emergencyFailed: number;
        details: any[];
    }>;
    getDaySchedule(date: string): Promise<{
        date: string;
        channelSchedules: {
            channel: {
                id: string;
                code: string;
                name: string;
                level: string;
                maxFlow: number;
            };
            allocations: any[];
        }[];
        applicationSummary: {
            id: string;
            farmerCode: string;
            farmerName: string;
            expectedFlow: number;
            expectedHours: number;
            requestVolume: number;
            status: string;
            failReason: string;
            submitTime: Date;
        }[];
    }>;
    getChannelSchedule(channelId: string, date: string): Promise<{
        channel: {
            id: string;
            code: string;
            name: string;
            maxFlow: number;
        };
        date: string;
        timeSlots: {
            slotIndex: number;
            timeRange: string;
            allocatedFlow: number;
            remainingCapacity: number;
            maxFlow: number;
            servingApplications: {
                appId: string;
                farmerCode: string;
                flow: number;
            }[];
        }[];
        allAllocations: {
            id: string;
            startTime: Date;
            endTime: Date;
            flow: number;
            application: {
                id: string;
                farmerCode: string;
                farmerName: string;
            };
        }[];
    }>;
    getFarmerPostponeHistory(farmerId: string): Promise<{
        id: string;
        applicationId: string;
        originalDate: string;
        targetDate: string;
        reason: string;
        createdAt: Date;
        application: {
            id: string;
            expectedFlow: number;
            expectedHours: number;
            requestVolume: number;
            status: string;
        };
    }[]>;
    getFarmerNotifications(farmerId: string, unreadOnly?: string): Promise<{
        type: string;
        title: string;
        id: string;
        createdAt: Date;
        content: string;
        farmerId: string | null;
        applicationId: string;
        isRead: boolean;
        isAdminAlert: boolean;
    }[]>;
    markNotificationAsRead(farmerId: string, notificationId: string): Promise<{
        type: string;
        title: string;
        id: string;
        createdAt: Date;
        content: string;
        farmerId: string | null;
        applicationId: string;
        isRead: boolean;
        isAdminAlert: boolean;
    }>;
    getAdminNotifications(unreadOnly?: string): Promise<({
        application: {
            farmer: {
                name: string;
                code: string;
                id: string;
            };
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
            isEmergency: boolean;
            emergencyReason: string | null;
            emergencyApprovalStatus: string | null;
            emergencyApprovedAt: Date | null;
            emergencyApprovedBy: string | null;
            emergencyRejectReason: string | null;
            emergencyTracedAt: Date | null;
        };
    } & {
        type: string;
        title: string;
        id: string;
        createdAt: Date;
        content: string;
        farmerId: string | null;
        applicationId: string;
        isRead: boolean;
        isAdminAlert: boolean;
    })[]>;
    markAdminNotificationAsRead(notificationId: string): Promise<{
        type: string;
        title: string;
        id: string;
        createdAt: Date;
        content: string;
        farmerId: string | null;
        applicationId: string;
        isRead: boolean;
        isAdminAlert: boolean;
    }>;
}
