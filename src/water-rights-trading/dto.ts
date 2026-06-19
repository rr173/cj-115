import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsInt, IsOptional, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { QuotaQuarter } from '../common/enums';

export class CreateSellOrderDto {
  @ApiProperty({ description: '卖方用水户ID' })
  @IsString()
  sellerId: string;

  @ApiProperty({ description: '年份' })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year: number;

  @ApiProperty({ enum: QuotaQuarter, description: '季度 Q1-Q4' })
  @IsEnum(QuotaQuarter)
  quarter: QuotaQuarter;

  @ApiProperty({ description: '出售量 m³' })
  @IsNumber()
  @IsPositive()
  sellVolume: number;

  @ApiProperty({ description: '单价 元/m³' })
  @IsNumber()
  @IsPositive()
  unitPrice: number;
}

export class BuySellOrderDto {
  @ApiProperty({ description: '卖单ID' })
  @IsString()
  sellOrderId: string;

  @ApiProperty({ description: '买方用水户ID' })
  @IsString()
  buyerId: string;

  @ApiProperty({ description: '购买量 m³' })
  @IsNumber()
  @IsPositive()
  buyVolume: number;
}

export class CancelSellOrderDto {
  @ApiProperty({ description: '卖单ID' })
  @IsString()
  sellOrderId: string;
}

export class GetMarketSellOrdersDto {
  @ApiProperty({ description: '年份', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiProperty({ description: '季度', required: false, enum: QuotaQuarter })
  @IsOptional()
  @IsEnum(QuotaQuarter)
  quarter?: QuotaQuarter;
}

export class GetTradeHistoryDto {
  @ApiProperty({ description: '用水户ID' })
  @IsString()
  farmerId: string;
}

export class GetWaterRightsAccountDto {
  @ApiProperty({ description: '用水户ID' })
  @IsString()
  farmerId: string;

  @ApiProperty({ description: '年份' })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year: number;

  @ApiProperty({ enum: QuotaQuarter, description: '季度 Q1-Q4' })
  @IsEnum(QuotaQuarter)
  quarter: QuotaQuarter;
}
