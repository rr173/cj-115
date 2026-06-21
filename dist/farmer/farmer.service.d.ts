import { PrismaService } from '../prisma/prisma.service';
import { ChannelService } from '../channel/channel.service';
import { CreateFarmerDto, UpdateFarmerDto } from './dto';
export declare class FarmerService {
    private prisma;
    private channelService;
    constructor(prisma: PrismaService, channelService: ChannelService);
    create(dto: CreateFarmerDto): Promise<{
        channel: {
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
        };
    } & {
        name: string;
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        channelId: string;
        area: number;
    }>;
    findAll(): Promise<({
        channel: {
            name: string;
            code: string;
            id: string;
        };
        quotas: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            farmerId: string;
            quarter: string;
            year: number;
            amount: number;
        }[];
    } & {
        name: string;
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        channelId: string;
        area: number;
    })[]>;
    findOne(id: string): Promise<{
        channel: {
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
        };
        quotas: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            farmerId: string;
            quarter: string;
            year: number;
            amount: number;
        }[];
        applications: {
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
        }[];
    } & {
        name: string;
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        channelId: string;
        area: number;
    }>;
    findByCode(code: string): Promise<{
        channel: {
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
        };
        quotas: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            farmerId: string;
            quarter: string;
            year: number;
            amount: number;
        }[];
    } & {
        name: string;
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        channelId: string;
        area: number;
    }>;
    update(id: string, dto: UpdateFarmerDto): Promise<{
        name: string;
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        channelId: string;
        area: number;
    }>;
    remove(id: string): Promise<{
        name: string;
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        channelId: string;
        area: number;
    }>;
}
