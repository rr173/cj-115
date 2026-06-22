import { Controller, Get, Post, Put, Delete, Body, Param, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { GroundwaterService } from './groundwater.service';
import {
  CreateIrrigationZoneDto,
  UpdateIrrigationZoneDto,
  AdjustRedlineDto,
  RecordWaterLevelDepthDto,
  CreatePumpingWellDto,
  UpdatePumpingWellDto,
  GenerateJointSupplyPlanDto,
  AddZoneChannelDto,
  RegisterSmartMeterDto,
  UpdateSmartMeterDto,
  UpdateCoefficientDto,
  ReportMeterReadingDto,
  ResolveMeterAbnormalDto,
  CreateElectricityQuotaDto,
  UpdateElectricityQuotaDto,
} from './dto';

@ApiTags('机井补源与地下水开采管控')
@Controller('groundwater')
export class GroundwaterController {
  constructor(private readonly service: GroundwaterService) {}

  @Post('zones')
  @ApiOperation({ summary: '创建灌溉分区' })
  createZone(@Body() dto: CreateIrrigationZoneDto) {
    return this.service.createIrrigationZone(dto);
  }

  @Put('zones/:zoneId')
  @ApiOperation({ summary: '更新灌溉分区基本信息' })
  @ApiParam({ name: 'zoneId', description: '分区ID' })
  updateZone(@Param('zoneId') zoneId: string, @Body() dto: UpdateIrrigationZoneDto) {
    return this.service.updateIrrigationZone(zoneId, dto);
  }

  @Get('zones')
  @ApiOperation({ summary: '查询所有灌溉分区列表' })
  listZones() {
    return this.service.listIrrigationZones();
  }

  @Post('zones/channels')
  @ApiOperation({ summary: '为分区添加覆盖的农渠(一条农渠只能属于一个分区)' })
  addZoneChannel(@Body() dto: AddZoneChannelDto) {
    return this.service.addZoneChannel(dto);
  }

  @Delete('zones/:zoneId/channels/:channelId')
  @ApiOperation({ summary: '移除分区覆盖的农渠' })
  @ApiParam({ name: 'zoneId', description: '分区ID' })
  @ApiParam({ name: 'channelId', description: '渠道ID' })
  removeZoneChannel(@Param('zoneId') zoneId: string, @Param('channelId') channelId: string) {
    return this.service.removeZoneChannel(zoneId, channelId);
  }

  @Get('zones/:zoneId/channels')
  @ApiOperation({ summary: '查询分区覆盖的农渠列表' })
  @ApiParam({ name: 'zoneId', description: '分区ID' })
  getZoneChannels(@Param('zoneId') zoneId: string) {
    return this.service.getZoneChannels(zoneId);
  }

  @Get('zones/:zoneId/ledger')
  @ApiOperation({ summary: '查询分区水资源台账(地表水供水量、地下水开采量、红线剩余、当前埋深、超采状态)' })
  @ApiParam({ name: 'zoneId', description: '分区ID' })
  @ApiQuery({ name: 'year', description: '年度,默认当前年', required: false })
  getZoneLedger(@Param('zoneId') zoneId: string, @Query('year') year?: string) {
    return this.service.getZoneWaterLedger(zoneId, year ? parseInt(year) : undefined);
  }

  @Patch('zones/adjust-redline')
  @ApiOperation({ summary: '手动调整分区年度开采红线' })
  adjustRedline(@Body() dto: AdjustRedlineDto) {
    return this.service.adjustRedline(dto);
  }

  @Post('zones/record-depth')
  @ApiOperation({ summary: '录入最新实测地下水位埋深' })
  recordWaterLevelDepth(@Body() dto: RecordWaterLevelDepthDto) {
    return this.service.recordWaterLevelDepth(dto);
  }

  @Post('wells')
  @ApiOperation({ summary: '注册机井' })
  createWell(@Body() dto: CreatePumpingWellDto) {
    return this.service.createPumpingWell(dto);
  }

  @Put('wells/:wellId')
  @ApiOperation({ summary: '更新机井信息' })
  @ApiParam({ name: 'wellId', description: '机井ID' })
  updateWell(@Param('wellId') wellId: string, @Body() dto: UpdatePumpingWellDto) {
    return this.service.updatePumpingWell(wellId, dto);
  }

  @Get('wells')
  @ApiOperation({ summary: '查询机井列表' })
  @ApiQuery({ name: 'zoneId', description: '按分区筛选', required: false })
  listWells(@Query('zoneId') zoneId?: string) {
    return this.service.listPumpingWells(zoneId);
  }

  @Get('wells/:wellId/history')
  @ApiOperation({ summary: '查询某口机井的开采历史记录' })
  @ApiParam({ name: 'wellId', description: '机井ID' })
  @ApiQuery({ name: 'dateFrom', description: '起始日期 YYYY-MM-DD', required: false })
  @ApiQuery({ name: 'dateTo', description: '结束日期 YYYY-MM-DD', required: false })
  getWellHistory(
    @Param('wellId') wellId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.service.getPumpingWellHistory(wellId, dateFrom, dateTo);
  }

  @Post('supply/plan')
  @ApiOperation({ summary: '生成井渠联合供水方案(仅评估不执行)' })
  generatePlan(@Body() dto: GenerateJointSupplyPlanDto) {
    return this.service.generateJointSupplyPlan(dto);
  }

  @Post('supply/execute')
  @ApiOperation({ summary: '执行井渠联合供水方案(生成开采记录、更新分区台账)' })
  executePlan(@Body() dto: GenerateJointSupplyPlanDto) {
    return this.service.executeJointSupply(dto);
  }

  @Get('supply/plan/:applicationId')
  @ApiOperation({ summary: '查询某次配水需求的井渠联合供水方案明细' })
  @ApiParam({ name: 'applicationId', description: '用水申请ID' })
  getSupplyPlan(@Param('applicationId') applicationId: string) {
    return this.service.getJointSupplyPlan(applicationId);
  }

  @Get('alerts')
  @ApiOperation({ summary: '查询地下水告警列表' })
  @ApiQuery({ name: 'zoneId', description: '按分区筛选', required: false })
  @ApiQuery({ name: 'resolved', description: '是否已解决', required: false })
  listAlerts(@Query('zoneId') zoneId?: string, @Query('resolved') resolved?: string) {
    const isResolved = resolved === undefined ? undefined : resolved === 'true';
    return this.service.listAlerts(zoneId, isResolved);
  }

  @Post('meters')
  @ApiOperation({ summary: '为机井登记智能电表' })
  registerMeter(@Body() dto: RegisterSmartMeterDto) {
    return this.service.registerSmartMeter(dto);
  }

  @Put('meters/:meterId')
  @ApiOperation({ summary: '更新电表信息' })
  @ApiParam({ name: 'meterId', description: '电表ID' })
  updateMeter(@Param('meterId') meterId: string, @Body() dto: UpdateSmartMeterDto) {
    return this.service.updateSmartMeter(meterId, dto);
  }

  @Get('meters')
  @ApiOperation({ summary: '查询智能电表列表' })
  @ApiQuery({ name: 'zoneId', description: '按分区筛选', required: false })
  listMeters(@Query('zoneId') zoneId?: string) {
    return this.service.listSmartMeters(zoneId);
  }

  @Get('meters/:meterId')
  @ApiOperation({ summary: '查询单块电表详情' })
  @ApiParam({ name: 'meterId', description: '电表ID' })
  getMeter(@Param('meterId') meterId: string) {
    return this.service.getSmartMeter(meterId);
  }

  @Patch('wells/coefficient')
  @ApiOperation({ summary: '更新机井以电折水系数' })
  updateCoefficient(@Body() dto: UpdateCoefficientDto) {
    return this.service.updateCoefficient(dto);
  }

  @Post('meters/readings')
  @ApiOperation({ summary: '上报电表读数(自动折算抽水量,校验电量配额)' })
  reportReading(@Body() dto: ReportMeterReadingDto) {
    return this.service.reportMeterReading(dto);
  }

  @Get('meters/readings')
  @ApiOperation({ summary: '查询电表读数上报流水' })
  @ApiQuery({ name: 'wellId', description: '按机井筛选', required: false })
  @ApiQuery({ name: 'meterId', description: '按电表筛选', required: false })
  @ApiQuery({ name: 'dateFrom', description: '起始日期 YYYY-MM-DD', required: false })
  @ApiQuery({ name: 'dateTo', description: '结束日期 YYYY-MM-DD', required: false })
  listReadings(
    @Query('wellId') wellId?: string,
    @Query('meterId') meterId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.service.listMeterReadings(wellId, meterId, dateFrom, dateTo);
  }

  @Get('meters/abnormal-alerts')
  @ApiOperation({ summary: '查询电表异常告警列表' })
  @ApiQuery({ name: 'resolved', description: '是否已处理', required: false })
  listAbnormalAlerts(@Query('resolved') resolved?: string) {
    const isResolved = resolved === undefined ? undefined : resolved === 'true';
    return this.service.listMeterAbnormalAlerts(isResolved);
  }

  @Post('meters/abnormal-alerts/resolve')
  @ApiOperation({ summary: '处理电表异常告警(核定新基准读数,恢复计量)' })
  resolveAbnormal(@Body() dto: ResolveMeterAbnormalDto) {
    return this.service.resolveMeterAbnormal(dto);
  }

  @Post('electricity-quotas')
  @ApiOperation({ summary: '创建分区灌溉季电量配额' })
  createQuota(@Body() dto: CreateElectricityQuotaDto) {
    return this.service.createElectricityQuota(dto);
  }

  @Put('electricity-quotas/:quotaId')
  @ApiOperation({ summary: '调整电量配额(扩配)' })
  @ApiParam({ name: 'quotaId', description: '配额ID' })
  updateQuota(@Param('quotaId') quotaId: string, @Body() dto: UpdateElectricityQuotaDto) {
    return this.service.updateElectricityQuota(quotaId, dto);
  }

  @Get('electricity-quotas')
  @ApiOperation({ summary: '查询电量配额列表' })
  @ApiQuery({ name: 'zoneId', description: '按分区筛选', required: false })
  listQuotas(@Query('zoneId') zoneId?: string) {
    return this.service.listElectricityQuotas(zoneId);
  }

  @Get('electricity-quotas/:quotaId/usage')
  @ApiOperation({ summary: '查询电量配额使用详情及各井耗电明细' })
  @ApiParam({ name: 'quotaId', description: '配额ID' })
  getQuotaUsage(@Param('quotaId') quotaId: string) {
    return this.service.getElectricityQuotaUsage(quotaId);
  }

  @Get('wells/:wellId/reconciliation')
  @ApiOperation({ summary: '查询单口机电折水与推算量对账报表' })
  @ApiParam({ name: 'wellId', description: '机井ID' })
  @ApiQuery({ name: 'dateFrom', description: '起始日期 YYYY-MM-DD', required: false })
  @ApiQuery({ name: 'dateTo', description: '结束日期 YYYY-MM-DD', required: false })
  getWellReconciliation(
    @Param('wellId') wellId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.service.getWellReconciliation(wellId, dateFrom, dateTo);
  }

  @Get('zones/:zoneId/reconciliation')
  @ApiOperation({ summary: '查询分区电折水与推算量对账汇总报表(含各井明细)' })
  @ApiParam({ name: 'zoneId', description: '分区ID' })
  @ApiQuery({ name: 'dateFrom', description: '起始日期 YYYY-MM-DD', required: false })
  @ApiQuery({ name: 'dateTo', description: '结束日期 YYYY-MM-DD', required: false })
  getZoneReconciliation(
    @Param('zoneId') zoneId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.service.getZoneReconciliation(zoneId, dateFrom, dateTo);
  }
}
