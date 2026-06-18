import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { InspectionService } from './inspection.service';
import { CreateInspectionDto, CreateMaintenanceOrderDto } from './dto';
import { ProblemLevel, MaintenanceOrderStatus } from '../common/enums';

@ApiTags('渠道巡检与维护')
@Controller()
export class InspectionController {
  constructor(private readonly service: InspectionService) {}

  @Post('inspections')
  @ApiOperation({ summary: '提交巡检报告(紧急问题自动将渠道状态置为待维修)' })
  createInspection(@Body() dto: CreateInspectionDto) {
    return this.service.createInspection(dto);
  }

  @Get('inspections')
  @ApiOperation({ summary: '查询巡检记录列表(可按渠道、日期范围筛选)' })
  @ApiQuery({ name: 'channelId', required: false })
  @ApiQuery({ name: 'startDate', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: false, description: 'YYYY-MM-DD' })
  findInspections(
    @Query('channelId') channelId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.findInspections(channelId, startDate, endDate);
  }

  @Get('inspections/channel/:channelId')
  @ApiOperation({ summary: '按渠道查询巡检历史' })
  @ApiParam({ name: 'channelId', description: '渠道ID' })
  getChannelInspectionHistory(@Param('channelId') channelId: string) {
    return this.service.getChannelInspectionHistory(channelId);
  }

  @Get('inspections/statistics')
  @ApiOperation({ summary: '按渠道和时间段统计各级别问题数量分布' })
  @ApiQuery({ name: 'channelId', required: true })
  @ApiQuery({ name: 'startDate', required: true, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: true, description: 'YYYY-MM-DD' })
  getInspectionStatistics(
    @Query('channelId') channelId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.service.getInspectionStatistics(channelId, startDate, endDate);
  }

  @Get('inspections/overdue')
  @ApiOperation({ summary: '查询超期未巡检的渠道列表(根据每条渠道的巡检周期判定)' })
  getOverdueChannels() {
    return this.service.getOverdueChannels();
  }

  @Post('maintenance-orders')
  @ApiOperation({ summary: '创建维护工单(仅待维修渠道,自动检测停水窗口冲突)' })
  createMaintenanceOrder(@Body() dto: CreateMaintenanceOrderDto) {
    return this.service.createMaintenanceOrder(dto);
  }

  @Get('maintenance-orders')
  @ApiOperation({ summary: '查询维护工单列表' })
  @ApiQuery({ name: 'status', required: false, enum: MaintenanceOrderStatus })
  @ApiQuery({ name: 'channelId', required: false })
  findMaintenanceOrders(
    @Query('status') status?: string,
    @Query('channelId') channelId?: string,
  ) {
    return this.service.findMaintenanceOrders(status, channelId);
  }

  @Get('maintenance-orders/:id')
  @ApiOperation({ summary: '查询维护工单详情' })
  @ApiParam({ name: 'id', description: '工单ID' })
  findOneMaintenanceOrder(@Param('id') id: string) {
    return this.service.findOneMaintenanceOrder(id);
  }

  @Put('maintenance-orders/:id/approve')
  @ApiOperation({ summary: '审批维护工单(自动分析停水影响并取消受影响的配水申请)' })
  @ApiParam({ name: 'id', description: '工单ID' })
  approveMaintenanceOrder(@Param('id') id: string) {
    return this.service.approveMaintenanceOrder(id);
  }

  @Put('maintenance-orders/:id/start')
  @ApiOperation({ summary: '开始施工(渠道状态变更为维修中)' })
  @ApiParam({ name: 'id', description: '工单ID' })
  startMaintenanceOrder(@Param('id') id: string) {
    return this.service.startMaintenanceOrder(id);
  }

  @Put('maintenance-orders/:id/accept')
  @ApiOperation({ summary: '验收工单' })
  @ApiParam({ name: 'id', description: '工单ID' })
  acceptMaintenanceOrder(@Param('id') id: string) {
    return this.service.acceptMaintenanceOrder(id);
  }

  @Put('maintenance-orders/:id/close')
  @ApiOperation({ summary: '关闭工单(无其他活跃工单时渠道状态变更为已完工)' })
  @ApiParam({ name: 'id', description: '工单ID' })
  closeMaintenanceOrder(@Param('id') id: string) {
    return this.service.closeMaintenanceOrder(id);
  }

  @Get('stop-water/schedule')
  @ApiOperation({ summary: '查询日期范围内所有计划停水的渠道列表和维护工单信息' })
  @ApiQuery({ name: 'startDate', required: true, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: true, description: 'YYYY-MM-DD' })
  getStopWaterSchedule(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.service.getStopWaterSchedule(startDate, endDate);
  }

  @Put('channels/:channelId/inspection-status/reset')
  @ApiOperation({ summary: '将已完工渠道的巡检状态重置为正常' })
  @ApiParam({ name: 'channelId', description: '渠道ID' })
  resetChannelInspectionStatus(@Param('channelId') channelId: string) {
    return this.service.resetChannelInspectionStatus(channelId);
  }
}
