import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { WaterBillingService } from './water-billing.service';
import {
  CreateWaterPriceSchemeDto,
  UpdateWaterPriceSchemeDto,
  BindChannelPriceSchemeDto,
  GenerateBillsDto,
  GetFarmerBillDto,
  ChannelBillSummaryDto,
  PayWaterBillDto,
  GetFarmerPaymentHistoryDto,
} from './dto';

@ApiTags('水费计量与阶梯水价结算')
@Controller('water-billing')
export class WaterBillingController {
  constructor(private readonly service: WaterBillingService) {}

  @Post('scheme')
  @ApiOperation({ summary: '创建水价方案' })
  createScheme(@Body() dto: CreateWaterPriceSchemeDto) {
    return this.service.createScheme(dto);
  }

  @Put('scheme/:id')
  @ApiOperation({ summary: '更新水价方案' })
  @ApiParam({ name: 'id', description: '水价方案ID' })
  updateScheme(@Param('id') id: string, @Body() dto: UpdateWaterPriceSchemeDto) {
    return this.service.updateScheme(id, dto);
  }

  @Get('schemes')
  @ApiOperation({ summary: '获取所有水价方案列表' })
  listSchemes() {
    return this.service.listSchemes();
  }

  @Get('scheme/:id')
  @ApiOperation({ summary: '获取水价方案详情' })
  @ApiParam({ name: 'id', description: '水价方案ID' })
  getScheme(@Param('id') id: string) {
    return this.service.getScheme(id);
  }

  @Delete('scheme/:id')
  @ApiOperation({ summary: '删除水价方案' })
  @ApiParam({ name: 'id', description: '水价方案ID' })
  deleteScheme(@Param('id') id: string) {
    return this.service.deleteScheme(id);
  }

  @Post('bind-scheme')
  @ApiOperation({ summary: '渠道绑定水价方案' })
  bindChannelPriceScheme(@Body() dto: BindChannelPriceSchemeDto) {
    return this.service.bindChannelPriceScheme(dto);
  }

  @Delete('unbind-scheme/:channelId')
  @ApiOperation({ summary: '渠道解绑水价方案' })
  @ApiParam({ name: 'channelId', description: '渠道ID' })
  unbindChannelPriceScheme(@Param('channelId') channelId: string) {
    return this.service.unbindChannelPriceScheme(channelId);
  }

  @Get('farmer-scheme/:farmerId')
  @ApiOperation({ summary: '查询用水户适用的水价方案(从农渠向上回溯)' })
  @ApiParam({ name: 'farmerId', description: '用水户ID' })
  findApplicableSchemeForFarmer(@Param('farmerId') farmerId: string) {
    return this.service.findApplicableSchemeForFarmer(farmerId);
  }

  @Post('generate-bills')
  @ApiOperation({ summary: '手动生成指定月份所有用水户的水费账单(每月1日系统自动执行)' })
  generateMonthlyBills(@Body() dto: GenerateBillsDto) {
    return this.service.generateMonthlyBills(dto);
  }

  @Get('farmer-bills')
  @ApiOperation({ summary: '按月查询某个用水户的账单详情列表' })
  getFarmerBills(@Query() dto: GetFarmerBillDto) {
    return this.service.getFarmerBills(dto);
  }

  @Get('bill/:billId')
  @ApiOperation({ summary: '获取单个账单详情(含阶梯明细、补贴、缴费记录)' })
  @ApiParam({ name: 'billId', description: '账单ID' })
  getBillDetail(@Param('billId') billId: string) {
    return this.service.getBillDetail(billId);
  }

  @Get('channel-summary')
  @ApiOperation({ summary: '按渠道汇总当月应收水费' })
  getChannelBillSummary(@Query() dto: ChannelBillSummaryDto) {
    return this.service.getChannelBillSummary(dto);
  }

  @Post('pay')
  @ApiOperation({ summary: '缴纳水费(支持全额和部分缴纳)' })
  payWaterBill(@Body() dto: PayWaterBillDto) {
    return this.service.payWaterBill(dto);
  }

  @Get('payment-history')
  @ApiOperation({ summary: '查询用水户历史缴费记录' })
  getFarmerPaymentHistory(@Query() dto: GetFarmerPaymentHistoryDto) {
    return this.service.getFarmerPaymentHistory(dto);
  }

  @Get('debt-status/:farmerId')
  @ApiOperation({ summary: '查询用水户当前欠费状态(含冻结状态)' })
  @ApiParam({ name: 'farmerId', description: '用水户ID' })
  getFarmerDebtStatus(@Param('farmerId') farmerId: string) {
    return this.service.getFarmerDebtStatus(farmerId);
  }

  @Get('can-apply/:farmerId')
  @ApiOperation({ summary: '检查用水户是否可提交新申请(欠费超过2个月冻结)' })
  @ApiParam({ name: 'farmerId', description: '用水户ID' })
  checkFarmerCanApply(@Param('farmerId') farmerId: string) {
    return this.service.checkFarmerCanApply(farmerId);
  }
}
