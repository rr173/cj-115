import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { WaterRightsTradingService } from './water-rights-trading.service';
import {
  CreateSellOrderDto,
  BuySellOrderDto,
  GetMarketSellOrdersDto,
  GetTradeHistoryDto,
  GetWaterRightsAccountDto,
} from './dto';
import { QuotaQuarter } from '../common/enums';

@ApiTags('水权交易')
@Controller('water-rights-trading')
export class WaterRightsTradingController {
  constructor(private readonly service: WaterRightsTradingService) {}

  @Post('sell-order')
  @ApiOperation({ summary: '挂牌出售水权额度(冻结出售量,7天有效期)' })
  createSellOrder(@Body() dto: CreateSellOrderDto) {
    return this.service.createSellOrder(dto);
  }

  @Post('buy')
  @ApiOperation({ summary: '购买已挂牌的卖单(支持部分购买,余额不足时拒绝)' })
  buySellOrder(@Body() dto: BuySellOrderDto) {
    return this.service.buySellOrder(dto);
  }

  @Delete('sell-order/:sellOrderId')
  @ApiOperation({ summary: '撤单(解冻剩余量归还)' })
  @ApiParam({ name: 'sellOrderId', description: '卖单ID' })
  cancelSellOrder(@Param('sellOrderId') sellOrderId: string) {
    return this.service.cancelSellOrder(sellOrderId);
  }

  @Get('market')
  @ApiOperation({ summary: '查询当前市场所有有效卖单(按单价升序)' })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'quarter', required: false, enum: QuotaQuarter })
  getMarketSellOrders(@Query() dto: GetMarketSellOrdersDto) {
    return this.service.getMarketSellOrders(dto);
  }

  @Get('trade-history')
  @ApiOperation({ summary: '查询某用水户的交易历史(买入和卖出)' })
  @ApiQuery({ name: 'farmerId', required: true })
  getTradeHistory(@Query() dto: GetTradeHistoryDto) {
    return this.service.getTradeHistory(dto);
  }

  @Get('account')
  @ApiOperation({ summary: '查询某用水户的水权账户明细(初始额度/买入/卖出/已用/冻结/可用)' })
  @ApiQuery({ name: 'farmerId', required: true })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'quarter', required: true, enum: QuotaQuarter })
  getWaterRightsAccount(@Query() dto: GetWaterRightsAccountDto) {
    return this.service.getWaterRightsAccountDetail(dto);
  }

  @Post('expire')
  @ApiOperation({ summary: '手动触发过期卖单处理(将超7天未成交的卖单作废,冻结量归还)' })
  expireOldOrders() {
    return this.service.expireOldOrders();
  }
}
