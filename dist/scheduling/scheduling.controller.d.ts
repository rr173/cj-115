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
        details: any[];
    }>;
    triggerAutoScheduling(date?: string): Promise<{
        targetDate: string;
        totalProcessed: number;
        scheduled: number;
        failed: number;
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
        farmerId: string;
        applicationId: string;
        isRead: boolean;
    }[]>;
    markNotificationAsRead(farmerId: string, notificationId: string): Promise<{
        type: string;
        title: string;
        id: string;
        createdAt: Date;
        content: string;
        farmerId: string;
        applicationId: string;
        isRead: boolean;
    }>;
}
