import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsDateString, IsInt, Min } from 'class-validator';

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
}

export class ListApplicationsDto {
  @ApiProperty({ description: '用水户ID', required: false })
  farmerId?: string;

  @ApiProperty({ description: '配水日期 YYYY-MM-DD', required: false })
  targetDate?: string;

  @ApiProperty({ description: '状态 PENDING/SCHEDULED/FAILED/CANCELLED_QUOTA/EXECUTED', required: false })
  status?: string;
}
