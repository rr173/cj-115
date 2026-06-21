import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsInt, IsOptional, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { QuotaQuarter } from '../common/enums';

export class UpdateChannelCoefficientDto {
  @ApiProperty({ description: '渠道水利用系数(0~1)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  coefficient: number;
}

export class QueryFarmerEfficiencyHistoryDto {
  @ApiProperty({ description: '用水户ID' })
  @IsString()
  farmerId: string;

  @ApiPropertyOptional({ description: '开始日期 YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: '结束日期 YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({ description: '页码(从1开始)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: '每页条数', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export class TriggerAssessmentDto {
  @ApiProperty({ description: '年份' })
  @Type(() => Number)
  @IsInt()
  year: number;

  @ApiProperty({ description: '季度', enum: QuotaQuarter })
  @IsEnum(QuotaQuarter)
  quarter: QuotaQuarter;
}

export class GetAssessmentDto {
  @ApiProperty({ description: '年份' })
  @Type(() => Number)
  @IsInt()
  year: number;

  @ApiProperty({ description: '季度', enum: QuotaQuarter })
  @IsEnum(QuotaQuarter)
  quarter: QuotaQuarter;
}
