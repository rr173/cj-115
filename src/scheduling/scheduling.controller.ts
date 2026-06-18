import { Controller, Get, Post, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { SchedulingService } from './scheduling.service';

@ApiTags('配水编排')
@Controller('scheduling')
export class SchedulingController {
  constructor(private readonly service: SchedulingService) {}

  @Post('run')
  @ApiOperation({ summary: '管理员触发某一天的配水编排(先到先得+30分钟步长延迟+传播延迟+流量约束)' })
  @ApiQuery({ name: 'date', description: '目标日期 YYYY-MM-DD', required: true })
  runScheduling(@Query('date') date: string) {
    return this.service.runScheduling(date);
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
}
