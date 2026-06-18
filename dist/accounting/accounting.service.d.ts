import { PrismaService } from '../prisma/prisma.service';
import { ReportUsageDto } from './dto';
export declare class AccountingService {
    private prisma;
    constructor(prisma: PrismaService);
    reportUsage(dto: ReportUsageDto): Promise<{
        applicationId: string;
        farmer: {
            id: string;
            code: string;
            name: string;
        };
        plannedVolume: number;
        actualVolume: number;
        deviationRate: string;
        isOveruse: boolean;
        isWaste: boolean;
        evaluation: string;
    }>;
    getFarmerDeviationList(dateFrom?: string, dateTo?: string): Promise<{
        id: string;
        applicationId: string;
        farmerCode: string;
        farmerName: string;
        plannedVolume: number;
        actualVolume: number;
        deviationRate: number;
        isOveruse: boolean;
        isWaste: boolean;
        evaluation: string;
        reportTime: Date;
    }[]>;
    getChannelWaterBalance(dateStr: string): Promise<{
        date: string;
        summary: {
            totalInflow: number;
            totalActualUsed: number;
            estimatedLeakageLoss: number;
            unaccountedDifference: number;
            leakageRateAssumption: string;
        };
        channelDetails: {
            channel: {
                id: string;
                code: string;
                name: string;
                level: string;
                length: number;
            };
            suppliedVolume: number;
            distributedToChildren: number;
            actualUsedByEnd: number;
            estimatedLeakageLoss: number;
            balance: number;
        }[];
    }>;
    getFarmerUsageSummary(farmerId: string, dateFrom?: string, dateTo?: string): Promise<{
        farmer: {
            id: string;
            code: string;
            name: string;
            area: number;
        };
        summary: {
            totalApplications: number;
            scheduledCount: number;
            executedCount: number;
            failedCount: number;
            cancelledCount: number;
            totalPlannedVolume: number;
            totalActualVolume: number;
            overuseCount: number;
            wasteCount: number;
        };
        applications: {
            id: string;
            targetDate: string;
            status: string;
            expectedFlow: number;
            expectedHours: number;
            plannedVolume: number;
            actualVolume: number;
            deviationRate: string;
            evaluation: string;
            scheduleSlots: {
                channel: {
                    name: string;
                    code: string;
                };
                startTime: Date;
                endTime: Date;
                flow: number;
            }[];
        }[];
    }>;
}
