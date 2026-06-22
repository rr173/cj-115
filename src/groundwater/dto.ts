import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateIrrigationZoneDto {
  @ApiProperty({ description: '分区编号' })
  @IsString()
  code: string;

  @ApiProperty({ description: '分区名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '年度地下水开采红线 m³' })
  @IsNumber()
  @IsPositive()
  annualExtractionRedline: number;

  @ApiProperty({ description: '当前地下水位埋深 m' })
  @IsNumber()
  @IsPositive()
  currentWaterLevelDepth: number;

  @ApiProperty({ description: '警戒埋深 m' })
  @IsNumber()
  @IsPositive()
  warningDepth: number;

  @ApiProperty({ description: '可采系数 m³/m（每降低1m水位可开采水量）', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  recoverableCoefficient?: number;
}

export class UpdateIrrigationZoneDto {
  @ApiProperty({ description: '分区名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '年度地下水开采红线 m³', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  annualExtractionRedline?: number;

  @ApiProperty({ description: '警戒埋深 m', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  warningDepth?: number;

  @ApiProperty({ description: '可采系数 m³/m', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  recoverableCoefficient?: number;
}

export class AdjustRedlineDto {
  @ApiProperty({ description: '分区ID' })
  @IsString()
  zoneId: string;

  @ApiProperty({ description: '新的年度开采红线 m³' })
  @IsNumber()
  @IsPositive()
  newRedline: number;

  @ApiProperty({ description: '调整原因', required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ description: '操作人', required: false })
  @IsOptional()
  @IsString()
  operator?: string;
}

export class RecordWaterLevelDepthDto {
  @ApiProperty({ description: '分区ID' })
  @IsString()
  zoneId: string;

  @ApiProperty({ description: '实测埋深 m' })
  @IsNumber()
  @IsPositive()
  measuredDepth: number;

  @ApiProperty({ description: '操作人', required: false })
  @IsOptional()
  @IsString()
  operator?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class CreatePumpingWellDto {
  @ApiProperty({ description: '机井编号' })
  @IsString()
  code: string;

  @ApiProperty({ description: '所属灌溉分区ID' })
  @IsString()
  zoneId: string;

  @ApiProperty({ description: '额定出水流量 m³/h' })
  @IsNumber()
  @IsPositive()
  ratedFlow: number;

  @ApiProperty({ description: '单位抽水成本 元/m³' })
  @IsNumber()
  @IsPositive()
  unitCost: number;

  @ApiProperty({ description: '关联的农渠ID', required: false })
  @IsOptional()
  @IsString()
  associatedChannelId?: string;

  @ApiProperty({ description: '关联服务的地块标识', required: false })
  @IsOptional()
  @IsString()
  associatedPlot?: string;
}

export class UpdatePumpingWellDto {
  @ApiProperty({ description: '所属灌溉分区ID', required: false })
  @IsOptional()
  @IsString()
  zoneId?: string;

  @ApiProperty({ description: '额定出水流量 m³/h', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  ratedFlow?: number;

  @ApiProperty({ description: '单位抽水成本 元/m³', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  unitCost?: number;

  @ApiProperty({ description: '关联的农渠ID', required: false })
  @IsOptional()
  @IsString()
  associatedChannelId?: string;

  @ApiProperty({ description: '关联服务的地块标识', required: false })
  @IsOptional()
  @IsString()
  associatedPlot?: string;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class GenerateJointSupplyPlanDto {
  @ApiProperty({ description: '用水申请ID' })
  @IsString()
  applicationId: string;
}

export class AddZoneChannelDto {
  @ApiProperty({ description: '灌溉分区ID' })
  @IsString()
  zoneId: string;

  @ApiProperty({ description: '渠道ID(农渠)' })
  @IsString()
  channelId: string;
}

export class RegisterSmartMeterDto {
  @ApiProperty({ description: '机井ID' })
  @IsString()
  wellId: string;

  @ApiProperty({ description: '智能电表表号' })
  @IsString()
  meterNo: string;

  @ApiProperty({ description: '电表初始读数(度)', required: false })
  @IsOptional()
  @IsNumber()
  initialReading?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateSmartMeterDto {
  @ApiProperty({ description: '电表表号', required: false })
  @IsOptional()
  @IsString()
  meterNo?: string;

  @ApiProperty({ description: '电表状态', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateCoefficientDto {
  @ApiProperty({ description: '机井ID' })
  @IsString()
  wellId: string;

  @ApiProperty({ description: '以电折水系数(立方米/度)' })
  @IsNumber()
  @IsPositive()
  coefficient: number;
}

export class ReportMeterReadingDto {
  @ApiProperty({ description: '电表表号' })
  @IsString()
  meterNo: string;

  @ApiProperty({ description: '本次上报读数(度)' })
  @IsNumber()
  @IsPositive()
  reading: number;

  @ApiProperty({ description: '上报时间(默认当前)', required: false })
  @IsOptional()
  reportedAt?: string;
}

export class ResolveMeterAbnormalDto {
  @ApiProperty({ description: '告警ID' })
  @IsString()
  alertId: string;

  @ApiProperty({ description: '新的基准读数(度)' })
  @IsNumber()
  @IsPositive()
  newBaselineReading: number;

  @ApiProperty({ description: '处理人' })
  @IsString()
  operator: string;
}

export class CreateElectricityQuotaDto {
  @ApiProperty({ description: '灌溉分区ID' })
  @IsString()
  zoneId: string;

  @ApiProperty({ description: '灌溉季名称,如"2026年春灌"' })
  @IsString()
  seasonName: string;

  @ApiProperty({ description: '灌溉季开始日期 YYYY-MM-DD' })
  @IsString()
  startDate: string;

  @ApiProperty({ description: '灌溉季结束日期 YYYY-MM-DD' })
  @IsString()
  endDate: string;

  @ApiProperty({ description: '电量配额(总度数)' })
  @IsNumber()
  @IsPositive()
  totalKwh: number;

  @ApiProperty({ description: '操作人', required: false })
  @IsOptional()
  @IsString()
  operator?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateElectricityQuotaDto {
  @ApiProperty({ description: '新的电量配额(总度数)', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  totalKwh?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}
