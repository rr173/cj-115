import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsDateString, IsOptional, IsInt, IsBoolean, Min, Max, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { DisputeType, DisputeStatus, MediationResult } from '../common/enums';

export class CreateDisputeDto {
  @ApiProperty({ description: '纠纷类型', enum: DisputeType })
  @IsString()
  type: string;

  @ApiProperty({ description: '涉及的用水户ID列表(至少2个)', type: [String] })
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  farmerIds: string[];

  @ApiProperty({ description: '纠纷描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '发生日期 YYYY-MM-DD' })
  @IsDateString()
  occurredAt: string;

  @ApiProperty({ description: '关联的配水申请ID列表(可选)', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicationIds?: string[];
}

export class AcceptDisputeDto {
  @ApiProperty({ description: '调解员姓名' })
  @IsString()
  mediatorName: string;

  @ApiProperty({ description: '预计处理天数' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expectedDays: number;
}

export class AddMediationRecordDto {
  @ApiProperty({ description: '记录人' })
  @IsString()
  recorderName: string;

  @ApiProperty({ description: '内容描述' })
  @IsString()
  content: string;

  @ApiProperty({ description: '是否涉及现场勘查', default: false, required: false })
  @IsOptional()
  @IsBoolean()
  isOnSiteInspection?: boolean;
}

export class CloseDisputeDto {
  @ApiProperty({ description: '处理结论', enum: MediationResult })
  @IsString()
  result: string;

  @ApiProperty({ description: '结论说明' })
  @IsString()
  resultNote: string;
}

export class QueryDisputesDto {
  @ApiProperty({ description: '开始日期 YYYY-MM-DD', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: '结束日期 YYYY-MM-DD', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: '纠纷类型筛选', enum: DisputeType, required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: '状态筛选', enum: DisputeStatus, required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: '是否超期筛选', required: false })
  @IsOptional()
  @IsBoolean()
  isOverdue?: boolean;

  @ApiProperty({ description: '页码(从1开始)', default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ description: '每页条数', default: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export class QuarterlyStatsDto {
  @ApiProperty({ description: '年份' })
  @Type(() => Number)
  @IsInt()
  year: number;

  @ApiProperty({ description: '季度(Q1/Q2/Q3/Q4)' })
  @IsString()
  quarter: string;
}
