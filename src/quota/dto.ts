import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsInt, IsNumber, IsPositive, Min } from 'class-validator';
import { QuotaQuarter } from '../common/enums';

export class SetQuotaDto {
  @ApiProperty({ description: '用水户ID' })
  @IsString()
  farmerId: string;

  @ApiProperty({ enum: QuotaQuarter, description: '季度 Q1-Q4' })
  @IsEnum(QuotaQuarter)
  quarter: QuotaQuarter;

  @ApiProperty({ description: '年份' })
  @IsInt()
  @Min(2000)
  year: number;

  @ApiProperty({ description: '亩均定额 m³/亩' })
  @IsNumber()
  @IsPositive()
  amount: number;
}

export class BatchSetQuotaDto {
  @ApiProperty({ type: [SetQuotaDto], description: '批量设置定额' })
  items: SetQuotaDto[];
}
