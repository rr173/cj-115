import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsEnum, IsOptional, IsPositive, IsInt, Min } from 'class-validator';
import { ProblemLevel } from '../common/enums';

export class CreateInspectionDto {
  @ApiProperty({ description: '巡检渠道ID' })
  @IsString()
  channelId: string;

  @ApiProperty({ description: '巡检员姓名' })
  @IsString()
  inspectorName: string;

  @ApiProperty({ description: '巡检日期 YYYY-MM-DD' })
  @IsDateString()
  inspectionDate: string;

  @ApiProperty({ description: '发现问题描述' })
  @IsString()
  description: string;

  @ApiProperty({ enum: ProblemLevel, description: '问题等级: MINOR一般, SEVERE严重, URGENT紧急' })
  @IsEnum(ProblemLevel)
  problemLevel: ProblemLevel;

  @ApiPropertyOptional({ description: '渗漏率实测值' })
  @IsOptional()
  @IsNumber()
  leakageRate?: number;

  @ApiPropertyOptional({ description: '淤积深度(cm)' })
  @IsOptional()
  @IsNumber()
  siltDepth?: number;

  @ApiPropertyOptional({ description: '衬砌破损长度(m)' })
  @IsOptional()
  @IsNumber()
  liningDamageLength?: number;
}

export class CreateMaintenanceOrderDto {
  @ApiProperty({ description: '渠道ID(须为待维修状态)' })
  @IsString()
  channelId: string;

  @ApiProperty({ description: '计划施工开始日期 YYYY-MM-DD' })
  @IsDateString()
  planStartDate: string;

  @ApiProperty({ description: '预计工期(天)' })
  @IsInt()
  @Min(1)
  estimatedDurationDays: number;

  @ApiProperty({ description: '施工队编号' })
  @IsString()
  crewCode: string;
}

export class ListInspectionsDto {
  @ApiPropertyOptional({ description: '渠道ID' })
  @IsOptional()
  @IsString()
  channelId?: string;

  @ApiPropertyOptional({ description: '开始日期 YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期 YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class InspectionStatisticsDto {
  @ApiProperty({ description: '渠道ID' })
  @IsString()
  channelId: string;

  @ApiProperty({ description: '开始日期 YYYY-MM-DD' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: '结束日期 YYYY-MM-DD' })
  @IsDateString()
  endDate: string;
}

export class StopWaterQueryDto {
  @ApiProperty({ description: '查询开始日期 YYYY-MM-DD' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: '查询结束日期 YYYY-MM-DD' })
  @IsDateString()
  endDate: string;
}
