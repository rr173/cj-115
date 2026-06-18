import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AccountingService } from './accounting.service';
import { ReportUsageDto } from './dto';

@ApiTags('水量核算')
@Controller('accounting')
export class AccountingController {
  constructor(private readonly service: AccountingService) {}

  @Post('report-usage')
  @ApiOperation({ summary: '用水户上报实际用水量(计算偏差率:超用>110%,浪费<60%)' })
  reportUsage(@Body() dto: ReportUsageDto) {
    return this.service.reportUsage(dto);
  }

  @Get('deviations')
  @ApiOperation({ summary: '查询用水偏差列表(超用/浪费标记)' })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  getDeviationList(@Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    return this.service.getFarmerDeviationList(dateFrom, dateTo);
  }

  @Get('balance')
  @ApiOperation({ summary: '按渠道汇总的水量平衡报表(入口供水量/各级分水量/末端用量/渗漏损耗)' })
  @ApiQuery({ name: 'date', description: '日期 YYYY-MM-DD', required: true })
  getChannelBalance(@Query('date') date: string) {
    return this.service.getChannelWaterBalance(date);
  }

  @Get('farmer/:farmerId')
  @ApiOperation({ summary: '用水户用水汇总(含计划量、实际量、偏差评价)' })
  @ApiParam({ name: 'farmerId' })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  getFarmerUsage(
    @Param('farmerId') farmerId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.service.getFarmerUsageSummary(farmerId, dateFrom, dateTo);
  }
}
