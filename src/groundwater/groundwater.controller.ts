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
}
