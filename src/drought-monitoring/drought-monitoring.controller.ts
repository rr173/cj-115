import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DroughtMonitoringService } from './drought-monitoring.service';
import {
  ReportWaterSourceDto,
  QueryDroughtEventsDto,
  CreateChannelTransferDto,
  QueryChannelTransfersDto,
  QuerySupplyDemandTrendDto,
} from './dto';

@ApiTags('旱情监测与应急调水')
@Controller('drought-monitoring')
export class DroughtMonitoringController {
  constructor(private readonly service: DroughtMonitoringService) {}

  @Post('source-report')
  @ApiOperation({ summary: '上报水源流量(干渠入口来水量),触发供需比计算和应急响应判断' })
  reportWaterSource(@Body() dto: ReportWaterSourceDto) {
    return this.service.reportWaterSource(dto);
  }

  @Get('status')
  @ApiOperation({ summary: '查询当前供需比和旱情状态' })
  getStatus() {
    return this.service.getStatus();
  }

  @Get('events')
  @ApiOperation({ summary: '查询旱情事件历史(按等级和时间范围)' })
  @ApiQuery({ name: 'level', required: false, description: '旱情等级: ABUNDANT/NORMAL/TENSE/SEVERE' })
  @ApiQuery({ name: 'startTime', required: false, description: '开始时间' })
  @ApiQuery({ name: 'endTime', required: false, description: '结束时间' })
  getDroughtEvents(
    @Query('level') level?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    return this.service.getDroughtEvents({
      level: level as any,
      startTime,
      endTime,
    });
  }

  @Get('affected-allocations')
  @ApiOperation({ summary: '查询当前被暂停和被削减的配水计划列表' })
  getAffectedAllocations() {
    return this.service.getAffectedAllocations();
  }

  @Post('trigger-emergency')
  @ApiOperation({ summary: '手动触发应急响应(不等自动触发)' })
  manualTriggerEmergency() {
    return this.service.manualTriggerEmergency();
  }

  @Post('lift-emergency')
  @ApiOperation({ summary: '手动解除应急状态(强制恢复所有计划)' })
  manualLiftEmergency() {
    return this.service.manualLiftEmergency();
  }

  @Post('channel-transfers')
  @ApiOperation({ summary: '创建渠道借调关系(空闲渠道借调给缺水渠道)' })
  createChannelTransfer(@Body() dto: CreateChannelTransferDto) {
    return this.service.createChannelTransfer(dto);
  }

  @Get('channel-transfers')
  @ApiOperation({ summary: '查询渠道借调关系' })
  @ApiQuery({ name: 'status', required: false, description: '借调状态: ACTIVE/RELEASED' })
  getChannelTransfers(
    @Query('status') status?: string,
  ) {
    return this.service.getChannelTransfers({
      status: status as any,
    });
  }

  @Get('supply-demand-trend')
  @ApiOperation({ summary: '查询供需比趋势(按小时聚合)' })
  @ApiQuery({ name: 'startTime', required: true, description: '开始时间' })
  @ApiQuery({ name: 'endTime', required: true, description: '结束时间' })
  getSupplyDemandTrend(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.service.getSupplyDemandTrend({ startTime, endTime });
  }

  @Get('channel-effective-capacity')
  @ApiOperation({ summary: '查询渠道有效容量(含借调容量)' })
  @ApiQuery({ name: 'channelId', required: true, description: '渠道ID' })
  getChannelEffectiveCapacity(
    @Query('channelId') channelId: string,
  ) {
    return this.service.getChannelEffectiveCapacity(channelId);
  }
}
