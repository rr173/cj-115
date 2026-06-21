import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { DroughtStatus, ChannelTransferStatus } from '../common/enums';

export class ReportWaterSourceDto {
  @ApiProperty({ description: '干渠入口渠道ID' })
  @IsString()
  channelId: string;

  @ApiProperty({ description: '当前实际来水流量(m³/s)' })
  @IsNumber()
  @IsPositive()
  flow: number;

  @ApiPropertyOptional({ description: '上报时间(ISO8601),默认当前时间' })
  @IsOptional()
  @IsDateString()
  reportedAt?: string;
}

export class QueryDroughtEventsDto {
  @ApiPropertyOptional({ enum: DroughtStatus, description: '旱情等级筛选' })
  @IsOptional()
  @IsEnum(DroughtStatus)
  level?: DroughtStatus;

  @ApiPropertyOptional({ description: '开始时间' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  @IsDateString()
  endTime?: string;
}

export class CreateChannelTransferDto {
  @ApiProperty({ description: '借出渠道ID(空闲渠道)' })
  @IsString()
  sourceChannelId: string;

  @ApiProperty({ description: '被借入渠道ID(缺水渠道)' })
  @IsString()
  targetChannelId: string;

  @ApiProperty({ description: '借调容量(m³/s)' })
  @IsNumber()
  @IsPositive()
  transferredCapacity: number;
}

export class QueryChannelTransfersDto {
  @ApiPropertyOptional({ enum: ChannelTransferStatus, description: '借调状态筛选' })
  @IsOptional()
  @IsEnum(ChannelTransferStatus)
  status?: ChannelTransferStatus;
}

export class QuerySupplyDemandTrendDto {
  @ApiProperty({ description: '开始时间' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: '结束时间' })
  @IsDateString()
  endTime: string;
}
