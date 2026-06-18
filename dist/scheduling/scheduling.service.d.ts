import { PrismaService } from '../prisma/prisma.service';
import { ChannelService } from '../channel/channel.service';
export declare class SchedulingService {
    private prisma;
    private channelService;
    constructor(prisma: PrismaService, channelService: ChannelService);
    private roundToNextSlot;
    private timeToSlotIndex;
    private slotIndexToTime;
    private buildSlotMap;
    private checkCapacity;
    private addFlowToSlots;
    runScheduling(targetDateStr: string): Promise<{
        targetDate: string;
        totalProcessed: number;
        scheduled: number;
        failed: number;
        details: any[];
    }>;
    getChannelSchedule(channelId: string, dateStr: string): Promise<{
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
            servingApplications: Array<{
                appId: string;
                farmerCode: string;
                flow: number;
            }>;
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
    getDaySchedule(dateStr: string): Promise<{
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
}
