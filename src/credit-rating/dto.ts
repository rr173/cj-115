import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class AdjustCreditScoreDto {
  @ApiProperty({ description: '调整分值(正数加分,负数减分)' })
  @Type(() => Number)
  @IsInt()
  adjustScore: number;

  @ApiProperty({ description: '调整原因' })
  @IsString()
  reason: string;

  @ApiProperty({ description: '操作人', required: false })
  @IsOptional()
  @IsString()
  operator?: string;
}

export class GetCreditHistoryDto {
  @ApiProperty({ description: '用水户ID' })
  @IsString()
  farmerId: string;

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
