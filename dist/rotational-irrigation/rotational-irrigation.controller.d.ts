import { RotationalIrrigationService } from './rotational-irrigation.service';
import { CreateIrrigationSeasonDto, CreateIrrigationRoundDto, UpdateIrrigationRoundDto } from './dto';
import { IrrigationRoundStatus } from '../common/enums';
export declare class RotationalIrrigationController {
    private readonly service;
    constructor(service: RotationalIrrigationService);
    createSeason(dto: CreateIrrigationSeasonDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
    }>;
    listSeasons(): Promise<{
        rounds: {
            status: IrrigationRoundStatus;
            statusName: string;
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
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            seasonId: string;
            waterLimit: number;
        }[];
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
    }[]>;
    getSeason(id: string): Promise<{
        rounds: {
            status: IrrigationRoundStatus;
            statusName: string;
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
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            seasonId: string;
            waterLimit: number;
        }[];
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
        status: IrrigationRoundStatus;
        statusName: string;
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
        status: IrrigationRoundStatus;
        statusName: string;
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
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        seasonId: string;
        waterLimit: number;
    }>;
    listRounds(seasonId?: string, status?: IrrigationRoundStatus): Promise<{
        status: IrrigationRoundStatus;
        statusName: string;
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
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        seasonId: string;
        waterLimit: number;
    }[]>;
    getRound(id: string): Promise<{
        status: IrrigationRoundStatus;
        statusName: string;
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
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        seasonId: string;
        waterLimit: number;
    }>;
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
    getRoundWaterUsage(id: string): Promise<{
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
    getRoundSummary(id: string): Promise<{
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
    getFarmerRoundInfo(farmerId: string): Promise<{
        error: string;
        farmer?: undefined;
        activeRound?: undefined;
        nextRound?: undefined;
    } | {
        farmer: {
            id: string;
            name: string;
            channel: {
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
        };
        activeRound: {
            status: IrrigationRoundStatus;
            statusName: string;
            season: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                startDate: Date;
                endDate: Date;
            };
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            seasonId: string;
            waterLimit: number;
        };
        nextRound: {
            status: IrrigationRoundStatus;
            statusName: string;
            startDateText: string;
            season: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                startDate: Date;
                endDate: Date;
            };
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            seasonId: string;
            waterLimit: number;
        };
        error?: undefined;
    }>;
}
