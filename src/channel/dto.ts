import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsPositive, IsOptional, Min, Max } from 'class-validator';
import { ChannelLevel } from '../common/enums';

export class CreateChannelDto {
  @ApiProperty({ description: '渠道编号' })
  @IsString()
  code: string;

  @ApiProperty({ description: '渠道名称' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ChannelLevel, description: '渠道级别: MAIN干渠, BRANCH支渠, LATERAL斗渠, FARM农渠' })
  @IsEnum(ChannelLevel)
  level: ChannelLevel;

  @ApiProperty({ description: '设计最大流量 m³/s' })
  @IsNumber()
  @IsPositive()
  maxFlow: number;

  @ApiProperty({ description: '长度 m' })
  @IsNumber()
  @IsPositive()
  length: number;

  @ApiPropertyOptional({ description: '上级渠道ID,干渠为空' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: '渠道水利用系数(0~1),默认0.95', default: 0.95 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  waterUtilizationCoefficient?: number;
}

export class UpdateChannelDto {
  @ApiPropertyOptional({ description: '渠道名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '设计最大流量 m³/s' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxFlow?: number;

  @ApiPropertyOptional({ description: '长度 m' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  length?: number;

  @ApiPropertyOptional({ description: '渠道水利用系数(0~1)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  waterUtilizationCoefficient?: number;
}
