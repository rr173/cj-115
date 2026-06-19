export declare class CreateIrrigationSeasonDto {
    name: string;
    startDate: string;
    endDate: string;
}
export declare class CreateIrrigationRoundDto {
    seasonId: string;
    name: string;
    startDate: string;
    endDate: string;
    waterLimit: number;
    channelIds: string[];
}
export declare class UpdateIrrigationRoundDto {
    name?: string;
    startDate?: string;
    endDate?: string;
    waterLimit?: number;
    channelIds?: string[];
}
