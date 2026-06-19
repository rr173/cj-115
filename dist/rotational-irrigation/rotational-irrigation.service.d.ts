import { PrismaService } from '../prisma/prisma.service';
import { CreateIrrigationSeasonDto, CreateIrrigationRoundDto, UpdateIrrigationRoundDto } from './dto';
import { IrrigationRoundStatus } from '../common/enums';
export declare class RotationalIrrigationService {
    private prisma;
    constructor(prisma: PrismaService);
    computeRoundStatus(startDate: Date, endDate: Date): IrrigationRoundStatus;
    private getChannelAndDescendants;
    private expandChannelIds;
    private checkDateOverlapInSeason;
    private checkChannelUniqueInSeason;
    createSeason(dto: CreateIrrigationSeasonDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
    }>;
    listSeasons(): Promise<({
        rounds: ({
            channels: ({
                channel: {
                    name: string;
                    code: string;
                    level: string;
                    id: string;
                };
            } & {
                id: string;
                channelId: string;
                roundId: string;
            })[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            seasonId: string;
            waterLimit: number;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
    })[]>;
    getSeason(id: string): Promise<{
        rounds: ({
            channels: ({
                channel: {
                    name: string;
                    code: string;
                    level: string;
                    id: string;
                };
            } & {
                id: string;
                channelId: string;
                roundId: string;
            })[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            seasonId: string;
            waterLimit: number;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
    }>;
    removeSeason(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
    }>;
    createRound(dto: CreateIrrigationRoundDto): Promise<{
        channels: ({
            channel: {
                name: string;
                code: string;
                level: string;
                id: string;
            };
        } & {
            id: string;
            channelId: string;
            roundId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        seasonId: string;
        waterLimit: number;
    }>;
    updateRound(id: string, dto: UpdateIrrigationRoundDto): Promise<{
        channels: ({
            channel: {
                name: string;
                code: string;
                level: string;
                id: string;
            };
        } & {
            id: string;
            channelId: string;
            roundId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        seasonId: string;
        waterLimit: number;
    }>;
    getRound(id: string): Promise<{
        channels: ({
            channel: {
                name: string;
                code: string;
                level: string;
                id: string;
            };
        } & {
            id: string;
            channelId: string;
            roundId: string;
        })[];
        season: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        seasonId: string;
        waterLimit: number;
    }>;
    listRounds(seasonId?: string, status?: IrrigationRoundStatus): Promise<({
        channels: ({
            channel: {
                name: string;
                code: string;
                level: string;
                id: string;
            };
        } & {
            id: string;
            channelId: string;
            roundId: string;
        })[];
        season: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        seasonId: string;
        waterLimit: number;
    })[]>;
    removeRound(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        seasonId: string;
        waterLimit: number;
    }>;
    findActiveRoundForChannel(channelId: string): Promise<{
        season: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        seasonId: string;
        waterLimit: number;
    }>;
    findNextRoundForChannel(channelId: string): Promise<{
        season: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        seasonId: string;
        waterLimit: number;
    }>;
    getRoundWaterUsage(roundId: string): Promise<{
        roundId: string;
        roundName: string;
        waterLimit: number;
        plannedVolume: number;
        actualVolume: number;
        remaining: number;
        usagePercent: number;
        warningLevel: "NORMAL" | "WARNING" | "CRITICAL";
        applicationCount: number;
    }>;
    getRoundSummary(roundId: string): Promise<{
        round: {
            id: string;
            name: string;
            startDate: Date;
            endDate: Date;
            waterLimit: number;
            status: IrrigationRoundStatus;
        };
        totalPlannedVolume: number;
        totalActualVolume: number;
        overallEfficiency: number;
        isOverLimit: boolean;
        overLimitAmount: number;
        channelStats: {
            channel: {
                name: string;
                code: string;
                level: string;
                id: string;
            };
            plannedVolume: number;
            actualVolume: number;
            efficiency: number;
            applicationCount: number;
        }[];
    }>;
    validateApplication(farmerId: string, targetDateStr: string, expectedHours: number, requestVolume: number): Promise<{
        roundId: string;
        roundName: string;
        warnings: string[];
    }>;
}
