import { PrismaService } from '../prisma/prisma.service';
import { CreateChannelDto, UpdateChannelDto } from './dto';
import { ChannelLevel } from '../common/enums';
export declare class ChannelService {
    private prisma;
    constructor(prisma: PrismaService);
    private validateTree;
    private detectCycle;
    create(dto: CreateChannelDto): Promise<{
        name: string;
        code: string;
        level: string;
        maxFlow: number;
        length: number;
        parentId: string | null;
        id: string;
        propagationDelay: number;
        inspectionStatus: string;
        inspectionCycleDays: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        parent: {
            name: string;
            code: string;
            id: string;
        };
        children: {
            name: string;
            code: string;
            level: string;
            maxFlow: number;
            length: number;
            parentId: string | null;
            id: string;
            propagationDelay: number;
            inspectionStatus: string;
            inspectionCycleDays: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        name: string;
        code: string;
        level: string;
        maxFlow: number;
        length: number;
        parentId: string | null;
        id: string;
        propagationDelay: number;
        inspectionStatus: string;
        inspectionCycleDays: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        parent: {
            name: string;
            code: string;
            level: string;
            maxFlow: number;
            length: number;
            parentId: string | null;
            id: string;
            propagationDelay: number;
            inspectionStatus: string;
            inspectionCycleDays: number;
            createdAt: Date;
            updatedAt: Date;
        };
        children: {
            name: string;
            code: string;
            level: string;
            maxFlow: number;
            length: number;
            parentId: string | null;
            id: string;
            propagationDelay: number;
            inspectionStatus: string;
            inspectionCycleDays: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        farmers: {
            name: string;
            code: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            channelId: string;
            area: number;
        }[];
    } & {
        name: string;
        code: string;
        level: string;
        maxFlow: number;
        length: number;
        parentId: string | null;
        id: string;
        propagationDelay: number;
        inspectionStatus: string;
        inspectionCycleDays: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByCode(code: string): Promise<{
        parent: {
            name: string;
            code: string;
            level: string;
            maxFlow: number;
            length: number;
            parentId: string | null;
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
        level: string;
        maxFlow: number;
        length: number;
        parentId: string | null;
        id: string;
        propagationDelay: number;
        inspectionStatus: string;
        inspectionCycleDays: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateChannelDto): Promise<{
        name: string;
        code: string;
        level: string;
        maxFlow: number;
        length: number;
        parentId: string | null;
        id: string;
        propagationDelay: number;
        inspectionStatus: string;
        inspectionCycleDays: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        name: string;
        code: string;
        level: string;
        maxFlow: number;
        length: number;
        parentId: string | null;
        id: string;
        propagationDelay: number;
        inspectionStatus: string;
        inspectionCycleDays: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getPathToRoot(channelId: string): Promise<Array<{
        id: string;
        code: string;
        level: ChannelLevel;
        propagationDelay: number;
        maxFlow: number;
    }>>;
}
