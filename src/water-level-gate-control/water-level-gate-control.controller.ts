import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { WaterLevelGateControlService } from './water-level-gate-control.service';
import { CreateMonitorDto, ReportReadingsDto, CreateGateDto, ManualGateOpeningDto, SwitchGateModeDto, QueryAlertsDto } from './dto';

@ApiTags('渠道水位遥测与闸门联动控制')
@Controller('water-level-gate-control')
export class WaterLevelGateControlController {
  constructor(private readonly service: WaterLevelGateControlService) {}

  @Post('monitors')
  @ApiOperation({ summary: '注册水位监测点' })
  createMonitor(@Body() dto: CreateMonitorDto) {
    return this.service.createMonitor(dto);
  }

  @Get('monitors/channel/:channelId')
  @ApiOperation({ summary: '查询某条渠道所有监测点的最新水位和状态' })
  @ApiParam({ name: 'channelId', description: '渠道ID' })
  getChannelMonitors(@Param('channelId') channelId: string) {
    return this.service.getChannelMonitors(channelId);
  }

  @Post('readings')
  @ApiOperation({ summary: '批量上报水位读数，触发自动控制计算' })
  reportReadings(@Body() dto: ReportReadingsDto) {
    return this.service.reportReadings(dto);
  }

  @Get('readings/:monitorId')
  @ApiOperation({ summary: '查询某监测点的历史水位记录(按时间范围)' })
  @ApiParam({ name: 'monitorId', description: '监测点ID' })
  @ApiQuery({ name: 'startTime', required: false, description: '开始时间' })
  @ApiQuery({ name: 'endTime', required: false, description: '结束时间' })
  getMonitorHistory(
    @Param('monitorId') monitorId: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    return this.service.getMonitorHistory(monitorId, startTime, endTime);
  }

  @Post('gates')
  @ApiOperation({ summary: '注册闸门(渠道起点进水闸)' })
  createGate(@Body() dto: CreateGateDto) {
    return this.service.createGate(dto);
  }

  @Get('gates/:gateId')
  @ApiOperation({ summary: '查询某闸门当前状态和最近调节记录' })
  @ApiParam({ name: 'gateId', description: '闸门ID' })
  getGateStatus(@Param('gateId') gateId: string) {
    return this.service.getGateStatus(gateId);
  }

  @Put('gates/:gateId/opening')
  @ApiOperation({ summary: '手动下发闸门开度指令(覆盖自动控制,持续到下一配水时段切换)' })
  @ApiParam({ name: 'gateId', description: '闸门ID' })
  manualSetOpening(@Param('gateId') gateId: string, @Body() dto: ManualGateOpeningDto) {
    return this.service.manualSetOpening(gateId, dto);
  }

  @Put('gates/:gateId/mode')
  @ApiOperation({ summary: '切换闸门控制模式(自动/手动)' })
  @ApiParam({ name: 'gateId', description: '闸门ID' })
  switchGateMode(@Param('gateId') gateId: string, @Body() dto: SwitchGateModeDto) {
    return this.service.switchGateMode(gateId, dto);
  }

  @Get('alerts')
  @ApiOperation({ summary: '查询当前所有告警(按类型和渠道筛选)' })
  @ApiQuery({ name: 'type', required: false, description: '告警类型: OVERFLOW/DRY/DEVICE_OFFLINE/ALL_OFFLINE' })
  @ApiQuery({ name: 'channelId', required: false, description: '渠道ID' })
  @ApiQuery({ name: 'unresolvedOnly', required: false, description: '是否只查未解决' })
  getAlerts(
    @Query('type') type?: string,
    @Query('channelId') channelId?: string,
    @Query('unresolvedOnly') unresolvedOnly?: string,
  ) {
    return this.service.getAlerts({
      type: type as any,
      channelId,
      unresolvedOnly: unresolvedOnly === 'true',
    });
  }
}
