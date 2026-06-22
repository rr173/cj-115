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
        emergencyScheduled: number;
        emergencyFailed: number;
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
        farmerId: string | null;
        applicationId: string;
        isRead: boolean;
        isAdminAlert: boolean;
    }[]>;
    getAdminNotifications(unreadOnly?: boolean): Promise<({
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
    markNotificationAsRead(notificationId: string, farmerId: string): Promise<{
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
    checkEmergencyApprovalTimeout(): Promise<void>;
    triggerManualScheduling(dateStr?: string): Promise<{
        targetDate: string;
        totalProcessed: number;
        scheduled: number;
        failed: number;
        emergencyScheduled: number;
        emergencyFailed: number;
        details: any[];
    }>;
}
