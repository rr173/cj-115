import { Controller, Get, Post, Query, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { SchedulingService } from './scheduling.service';
import { AutoSchedulingService } from './auto-scheduling.service';

@ApiTags('配水编排')
@Controller('scheduling')
export class SchedulingController {
  constructor(
    private readonly service: SchedulingService,
    private readonly autoService: AutoSchedulingService,
  ) {}

  @Post('run')
  @ApiOperation({ summary: '管理员触发某一天的配水编排(先到先得+30分钟步长延迟+传播延迟+流量约束)' })
  @ApiQuery({ name: 'date', description: '目标日期 YYYY-MM-DD', required: true })
  runScheduling(@Query('date') date: string) {
    return this.service.runScheduling(date);
  }

  @Post('auto-run')
  @ApiOperation({ summary: '手动触发自动编排流程（包含顺延处理）' })
  @ApiQuery({ name: 'date', description: '目标日期 YYYY-MM-DD，默认今天', required: false })
  triggerAutoScheduling(@Query('date') date?: string) {
    return this.autoService.triggerManualScheduling(date);
  }

  @Get('day')
  @ApiOperation({ summary: '查询某一天全渠网配水计划总表' })
  @ApiQuery({ name: 'date', description: '目标日期 YYYY-MM-DD', required: true })
  getDaySchedule(@Query('date') date: string) {
    return this.service.getDaySchedule(date);
  }

  @Get('channel/:channelId')
  @ApiOperation({ summary: '按渠道查询某一天的时段占用情况(每30分钟时隙)' })
  @ApiParam({ name: 'channelId', description: '渠道ID' })
  @ApiQuery({ name: 'date', description: '目标日期 YYYY-MM-DD', required: true })
  getChannelSchedule(@Param('channelId') channelId: string, @Query('date') date: string) {
    return this.service.getChannelSchedule(channelId, date);
  }

  @Get('farmer/:farmerId/postpone-history')
  @ApiOperation({ summary: '查询某用水户的申请顺延历史' })
  @ApiParam({ name: 'farmerId', description: '用水户ID' })
  async getFarmerPostponeHistory(@Param('farmerId') farmerId: string) {
    try {
      return await this.autoService.getFarmerPostponeHistory(farmerId);
    } catch (e) {
      if (e.message === '用水户不存在') {
        throw new NotFoundException(e.message);
      }
      throw new BadRequestException(e.message);
    }
  }

  @Get('farmer/:farmerId/notifications')
  @ApiOperation({ summary: '查询某用水户的通知列表' })
  @ApiParam({ name: 'farmerId', description: '用水户ID' })
  @ApiQuery({ name: 'unreadOnly', description: '仅显示未读', required: false, type: Boolean })
  getFarmerNotifications(
    @Param('farmerId') farmerId: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.autoService.getFarmerNotifications(farmerId, unreadOnly === 'true');
  }

  @Post('farmer/:farmerId/notifications/:notificationId/read')
  @ApiOperation({ summary: '标记通知为已读' })
  @ApiParam({ name: 'farmerId', description: '用水户ID' })
  @ApiParam({ name: 'notificationId', description: '通知ID' })
  async markNotificationAsRead(
    @Param('farmerId') farmerId: string,
    @Param('notificationId') notificationId: string,
  ) {
    try {
      return await this.autoService.markNotificationAsRead(notificationId, farmerId);
    } catch (e) {
      if (e.message === '通知不存在或无权访问') {
        throw new NotFoundException(e.message);
      }
      throw new BadRequestException(e.message);
    }
  }

  @Get('admin/notifications')
  @ApiOperation({ summary: '查询管理员通知列表(如紧急申请编排失败告警)' })
  @ApiQuery({ name: 'unreadOnly', description: '仅显示未读', required: false, type: Boolean })
  getAdminNotifications(@Query('unreadOnly') unreadOnly?: string) {
    return this.autoService.getAdminNotifications(unreadOnly === 'true');
  }

  @Post('admin/notifications/:notificationId/read')
  @ApiOperation({ summary: '标记管理员通知为已读' })
  @ApiParam({ name: 'notificationId', description: '通知ID' })
  async markAdminNotificationAsRead(@Param('notificationId') notificationId: string) {
    try {
      return await this.autoService.markAdminNotificationAsRead(notificationId);
    } catch (e) {
      if (e.message === '通知不存在或不是管理员通知') {
        throw new NotFoundException(e.message);
      }
      throw new BadRequestException(e.message);
    }
  }
}
