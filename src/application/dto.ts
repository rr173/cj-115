import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsDateString, IsInt, Min, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { EmergencyReason } from '../common/enums';

export class CreateApplicationDto {
  @ApiProperty({ description: '用水户ID' })
  @IsString()
  farmerId: string;

  @ApiProperty({ description: '期望流量 m³/s' })
  @IsNumber()
  @IsPositive()
  expectedFlow: number;

  @ApiProperty({ description: '期望时长 小时' })
  @IsNumber()
  @IsPositive()
  expectedHours: number;

  @ApiProperty({ description: '期望配水日期 YYYY-MM-DD' })
  @IsDateString()
  targetDate: string;

  @ApiProperty({ description: '是否为紧急申请', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isEmergency?: boolean;

  @ApiProperty({ description: '紧急原因 DROUGHT-作物旱情 FIRE_PREVENTION-防火需要 EQUIPMENT_FLUSH-设备冲洗 OTHER-其他', required: false, enum: EmergencyReason })
  @IsOptional()
  @IsEnum(EmergencyReason)
  emergencyReason?: EmergencyReason;
}

export class ListApplicationsDto {
  @ApiProperty({ description: '用水户ID', required: false })
  farmerId?: string;

  @ApiProperty({ description: '配水日期 YYYY-MM-DD', required: false })
  targetDate?: string;

  @ApiProperty({ description: '状态 PENDING/SCHEDULED/FAILED/CANCELLED_QUOTA/EXECUTED', required: false })
  status?: string;
}
