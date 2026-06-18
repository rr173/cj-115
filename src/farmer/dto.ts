import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class CreateFarmerDto {
  @ApiProperty({ description: '用水户编号' })
  @IsString()
  code: string;

  @ApiProperty({ description: '用水户名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '关联末级农渠ID' })
  @IsString()
  channelId: string;

  @ApiProperty({ description: '灌溉面积(亩)' })
  @IsNumber()
  @IsPositive()
  area: number;
}

export class UpdateFarmerDto {
  @ApiPropertyOptional({ description: '用水户名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '灌溉面积(亩)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  area?: number;

  @ApiPropertyOptional({ description: '关联末级农渠ID' })
  @IsOptional()
  @IsString()
  channelId?: string;
}
