import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsOptional, IsEnum, IsArray, IsDateString, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { GateControlMode, MonitorStatus, WaterLevelAlertType } from '../common/enums';

export class CreateMonitorDto {
  @ApiProperty({ description: '监测点编号' })
  @IsString()
  code: string;

  @ApiProperty({ description: '所属渠道ID' })
  @IsString()
  channelId: string;

  @ApiProperty({ description: '安装位置(距渠首多少米)' })
  @IsNumber()
  @IsPositive()
  installPosition: number;

  @ApiProperty({ description: '正常水位下限(m)' })
  @IsNumber()
  normalLower: number;

  @ApiProperty({ description: '正常水位上限(m)' })
  @IsNumber()
  normalUpper: number;

  @ApiProperty({ description: '超上限多少触发告警(m)' })
  @IsNumber()
  @IsPositive()
  alertOverUpper: number;

  @ApiProperty({ description: '低于下限多少触发告警(m)' })
  @IsNumber()
  @IsPositive()
  alertBelowLower: number;
}

export class WaterLevelReadingItemDto {
  @ApiProperty({ description: '监测点ID' })
  @IsString()
  monitorId: string;

  @ApiProperty({ description: '水位值(m)' })
  @IsNumber()
  value: number;

  @ApiProperty({ description: '采集时间戳' })
  @IsDateString()
  timestamp: string;
}

export class ReportReadingsDto {
  @ApiProperty({ description: '水位读数列表', type: [WaterLevelReadingItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WaterLevelReadingItemDto)
  readings: WaterLevelReadingItemDto[];
}

export class CreateGateDto {
  @ApiProperty({ description: '闸门编号' })
  @IsString()
  code: string;

  @ApiProperty({ description: '所属渠道ID(渠道起点进水闸)' })
  @IsString()
  channelId: string;

  @ApiProperty({ description: '最大开度(%)', default: 100 })
  @IsNumber()
  @IsPositive()
  maxOpening: number;
}

export class ManualGateOpeningDto {
  @ApiProperty({ description: '目标开度(%)' })
  @IsNumber()
  targetOpening: number;
}

export class SwitchGateModeDto {
  @ApiProperty({ enum: GateControlMode, description: '控制模式: AUTO自动/MANUAL手动' })
  @IsEnum(GateControlMode)
  controlMode: GateControlMode;
}

export class QueryReadingsDto {
  @ApiPropertyOptional({ description: '开始时间' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  @IsDateString()
  endTime?: string;
}

export class QueryAlertsDto {
  @ApiPropertyOptional({ enum: WaterLevelAlertType, description: '告警类型筛选' })
  @IsOptional()
  @IsEnum(WaterLevelAlertType)
  type?: WaterLevelAlertType;

  @ApiPropertyOptional({ description: '渠道ID筛选' })
  @IsOptional()
  @IsString()
  channelId?: string;

  @ApiPropertyOptional({ description: '是否只查未解决' })
  @IsOptional()
  @IsBoolean()
  unresolvedOnly?: boolean;
}
