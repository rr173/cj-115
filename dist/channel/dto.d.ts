import { ChannelLevel } from '../common/enums';
export declare class CreateChannelDto {
    code: string;
    name: string;
    level: ChannelLevel;
    maxFlow: number;
    length: number;
    parentId?: string;
    waterUtilizationCoefficient?: number;
}
export declare class UpdateChannelDto {
    name?: string;
    maxFlow?: number;
    length?: number;
    waterUtilizationCoefficient?: number;
}
