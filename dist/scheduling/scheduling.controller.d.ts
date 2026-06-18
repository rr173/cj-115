import { SchedulingService } from './scheduling.service';
export declare class SchedulingController {
    private readonly service;
    constructor(service: SchedulingService);
    runScheduling(date: string): Promise<{
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
}
