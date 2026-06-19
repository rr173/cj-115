import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsInt, IsOptional, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../common/enums';

export class CreateWaterPriceSchemeDto {
  @ApiProperty({ description: '水价方案名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '水价方案编码' })
  @IsString()
  code: string;

  @ApiProperty({ description: '基准水价 元/m³' })
  @IsNumber()
  @IsPositive()
  basePrice: number;

  @ApiProperty({ description: '第一档(定额内)价格倍数', default: 1.0, required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  tier1Multiplier?: number;

  @ApiProperty({ description: '第二档阈值(超定额比例)', default: 1.3, required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  tier2Threshold?: number;

  @ApiProperty({ description: '第二档价格倍数', default: 1.5, required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  tier2Multiplier?: number;

  @ApiProperty({ description: '第三档价格倍数', default: 2.0, required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  tier3Multiplier?: number;

  @ApiProperty({ description: '方案描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '是否启用', default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateWaterPriceSchemeDto {
  @ApiProperty({ description: '水价方案名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '基准水价 元/m³', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  basePrice?: number;

  @ApiProperty({ description: '第一档价格倍数', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  tier1Multiplier?: number;

  @ApiProperty({ description: '第二档阈值', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  tier2Threshold?: number;

  @ApiProperty({ description: '第二档价格倍数', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  tier2Multiplier?: number;

  @ApiProperty({ description: '第三档价格倍数', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  tier3Multiplier?: number;

  @ApiProperty({ description: '方案描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class BindChannelPriceSchemeDto {
  @ApiProperty({ description: '渠道ID' })
  @IsString()
  channelId: string;

  @ApiProperty({ description: '水价方案ID' })
  @IsString()
  schemeId: string;
}

export class GenerateBillsDto {
  @ApiProperty({ description: '账单年份' })
  @Type(() => Number)
  @IsInt()
  year: number;

  @ApiProperty({ description: '账单月份 1-12' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;
}

export class GetFarmerBillDto {
  @ApiProperty({ description: '用水户ID' })
  @IsString()
  farmerId: string;

  @ApiProperty({ description: '年份', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiProperty({ description: '月份 1-12', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}

export class ChannelBillSummaryDto {
  @ApiProperty({ description: '年份' })
  @Type(() => Number)
  @IsInt()
  year: number;

  @ApiProperty({ description: '月份 1-12' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ description: '渠道ID,不传则汇总所有渠道', required: false })
  @IsOptional()
  @IsString()
  channelId?: string;
}

export class PayWaterBillDto {
  @ApiProperty({ description: '账单ID' })
  @IsString()
  billId: string;

  @ApiProperty({ description: '缴费金额', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiProperty({ description: '缴费方式 FULL全额/PARTIAL部分', enum: PaymentMethod, default: PaymentMethod.FULL })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class GetFarmerPaymentHistoryDto {
  @ApiProperty({ description: '用水户ID' })
  @IsString()
  farmerId: string;
}
