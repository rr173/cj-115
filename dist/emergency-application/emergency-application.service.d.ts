import { PrismaService } from '../prisma/prisma.service';
import { CreditRatingService } from '../credit-rating/credit-rating.service';
import { EmergencyApprovalDto, ListEmergencyApplicationsDto, EmergencyStatisticsDto } from './dto';
export declare class EmergencyApplicationService {
    private prisma;
    private creditRatingService;
    constructor(prisma: PrismaService, creditRatingService: CreditRatingService);
    approve(id: string, dto: EmergencyApprovalDto): Promise<{
        id: string;
        result: "APPROVED" | "REJECTED";
        farmerId: string;
        farmerCode: string;
        farmerName: string;
        emergencyReason: string;
        creditDeducted: number;
        approvedAt: any;
        approvedBy: any;
        rejectReason: string;
    }>;
    findAll(dto: ListEmergencyApplicationsDto): Promise<{
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
        list: {
            id: string;
            farmerId: string;
            farmerCode: string;
            farmerName: string;
            expectedFlow: number;
            expectedHours: number;
            requestVolume: number;
            targetDate: string;
            status: string;
            emergencyReason: string;
            emergencyApprovalStatus: string;
            emergencyApprovedAt: Date;
            emergencyApprovedBy: string;
            emergencyRejectReason: string;
            emergencyTracedAt: Date;
            submitTime: Date;
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
        }[];
    }>;
    getMonthlyStatistics(dto: EmergencyStatisticsDto): Promise<{
        year: number;
        month: number;
        summary: {
            totalEmergencyApplications: number;
            totalApproved: number;
            totalRejected: number;
            totalPending: number;
            totalTraced: number;
            totalReviewed: number;
            overallApprovalRate: number;
        };
        farmerStatistics: {
            approvalRate: number;
            farmerId: string;
            farmerCode: string;
            farmerName: string;
            totalCount: number;
            approvedCount: number;
            rejectedCount: number;
            pendingCount: number;
            tracedCount: number;
        }[];
    }>;
    findOne(id: string): Promise<{
        id: string;
        farmerId: string;
        farmerCode: string;
        farmerName: string;
        channel: {
            name: string;
            code: string;
            id: string;
        };
        expectedFlow: number;
        expectedHours: number;
        requestVolume: number;
        targetDate: string;
        originalTargetDate: string;
        status: string;
        failReason: string;
        emergencyReason: string;
        emergencyApprovalStatus: string;
        emergencyApprovedAt: Date;
        emergencyApprovedBy: string;
        emergencyRejectReason: string;
        emergencyTracedAt: Date;
        submitTime: Date;
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
        createdAt: Date;
    }>;
}
