import { PrismaService } from '../prisma/prisma.service';
import { SchedulingService } from './scheduling.service';
export declare class AutoSchedulingService {
    private prisma;
    private schedulingService;
    private readonly logger;
    constructor(prisma: PrismaService, schedulingService: SchedulingService);
    handleDailyScheduling(): Promise<{
        targetDate: string;
        totalProcessed: number;
        scheduled: number;
        failed: number;
        details: any[];
    }>;
    private processFailedApplications;
    private handlePostponementForFailedApps;
    private tryPostponeApplication;
    private findNextAvailableDate;
    private getAncestorChannelIds;
    private markAsFinalFailed;
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
    getFarmerNotifications(farmerId: string, unreadOnly?: boolean): Promise<{
        type: string;
        title: string;
        id: string;
        createdAt: Date;
        content: string;
        farmerId: string;
        applicationId: string;
        isRead: boolean;
    }[]>;
    markNotificationAsRead(notificationId: string, farmerId: string): Promise<{
        type: string;
        title: string;
        id: string;
        createdAt: Date;
        content: string;
        farmerId: string;
        applicationId: string;
        isRead: boolean;
    }>;
    triggerManualScheduling(dateStr?: string): Promise<{
        targetDate: string;
        totalProcessed: number;
        scheduled: number;
        failed: number;
        details: any[];
    }>;
}
