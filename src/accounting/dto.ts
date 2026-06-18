import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive } from 'class-validator';

export class ReportUsageDto {
  @ApiProperty({ description: '关联的用水申请ID' })
  @IsString()
  applicationId: string;

  @ApiProperty({ description: '实际用水量 m³' })
  @IsNumber()
  @IsPositive()
  actualVolume: number;
}
