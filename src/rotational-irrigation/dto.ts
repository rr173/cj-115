import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsArray, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class CreateIrrigationSeasonDto {
  @ApiProperty({ description: '灌溉季名称,如"2026夏灌"' })
  @IsString()
  name: string;

  @ApiProperty({ description: '开始日期 YYYY-MM-DD' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: '结束日期 YYYY-MM-DD' })
  @IsDateString()
  endDate: string;
}

export class CreateIrrigationRoundDto {
  @ApiProperty({ description: '所属灌溉季ID' })
  @IsString()
  seasonId: string;

  @ApiProperty({ description: '轮次名称,如"第一轮-东片区"' })
  @IsString()
  name: string;

  @ApiProperty({ description: '开始日期 YYYY-MM-DD' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: '结束日期 YYYY-MM-DD' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: '总供水量上限(m³)' })
  @IsNumber()
  @IsPositive()
  waterLimit: number;

  @ApiProperty({ description: '参与渠道ID列表(选某条渠道则包含其所有子渠道)' })
  @IsArray()
  @IsString({ each: true })
  channelIds: string[];
}

export class UpdateIrrigationRoundDto {
  @ApiPropertyOptional({ description: '轮次名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '开始日期 YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期 YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '总供水量上限(m³)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  waterLimit?: number;

  @ApiPropertyOptional({ description: '参与渠道ID列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  channelIds?: string[];
}
