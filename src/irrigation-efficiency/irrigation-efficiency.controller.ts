import { Controller, Get, Put, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { IrrigationEfficiencyService } from './irrigation-efficiency.service';
import { UpdateChannelCoefficientDto, QueryFarmerEfficiencyHistoryDto, TriggerAssessmentDto, GetAssessmentDto } from './dto';
import { QuotaQuarter } from '../common/enums';

@ApiTags('灌溉效率与节水考核')
@Controller('irrigation-efficiency')
export class IrrigationEfficiencyController {
  constructor(private readonly service: IrrigationEfficiencyService) {}

  @Get('channel/:channelId/coefficient')
  @ApiOperation({ summary: '查询渠道水利用系数和综合系数(从干渠到该渠道的连乘值)' })
  @ApiParam({ name: 'channelId', description: '渠道ID' })
  getChannelCoefficient(@Param('channelId') channelId: string) {
    return this.service.getChannelCoefficient(channelId);
  }

  @Put('channel/:channelId/coefficient')
  @ApiOperation({ summary: '修改渠道水利用系数(0~1之间)' })
  @ApiParam({ name: 'channelId', description: '渠道ID' })
  updateChannelCoefficient(
    @Param('channelId') channelId: string,
    @Body() dto: UpdateChannelCoefficientDto,
  ) {
    return this.service.updateChannelCoefficient(channelId, dto);
  }

  @Get('allocation/:applicationId')
  @ApiOperation({ summary: '查询某次配水的效率明细(计划量/理论到田/实际用水/偏差率)' })
  @ApiParam({ name: 'applicationId', description: '用水申请ID' })
  getAllocationEfficiency(@Param('applicationId') applicationId: string) {
    return this.service.getAllocationEfficiencyDetail(applicationId);
  }

  @Get('farmer/:farmerId/history')
  @ApiOperation({ summary: '按时间范围查询某用水户的历史效率记录' })
  @ApiParam({ name: 'farmerId', description: '用水户ID' })
  @ApiQuery({ name: 'dateFrom', description: '开始日期 YYYY-MM-DD', required: false })
  @ApiQuery({ name: 'dateTo', description: '结束日期 YYYY-MM-DD', required: false })
  @ApiQuery({ name: 'page', description: '页码(从1开始)', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', description: '每页条数', required: false, type: Number })
  getFarmerEfficiencyHistory(
    @Param('farmerId') farmerId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const dto: QueryFarmerEfficiencyHistoryDto = {
      farmerId,
      dateFrom,
      dateTo,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    };
    return this.service.getFarmerEfficiencyHistory(dto);
  }

  @Get('assessment')
  @ApiOperation({ summary: '查询某季度的考核报告(渠道维度和用水户维度)' })
  @ApiQuery({ name: 'year', description: '年份', required: true, type: Number })
  @ApiQuery({ name: 'quarter', description: '季度 Q1/Q2/Q3/Q4', required: true, enum: QuotaQuarter })
  getQuarterlyAssessment(
    @Query('year') year: string,
    @Query('quarter') quarter: string,
  ) {
    return this.service.getQuarterlyAssessment(parseInt(year, 10), quarter);
  }

  @Post('assessment/trigger')
  @ApiOperation({ summary: '手动触发季度考核(不等季度末自动执行)' })
  triggerAssessment(@Body() dto: TriggerAssessmentDto) {
    return this.service.triggerQuarterlyAssessment(dto);
  }
}
