import { Controller, Get, Post, Param, Body, Query, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreditRatingService } from './credit-rating.service';
import { AdjustCreditScoreDto, GetCreditHistoryDto } from './dto';

@ApiTags('用水户信用评级')
@Controller('credit-rating')
export class CreditRatingController {
  constructor(private readonly service: CreditRatingService) {}

  @Get(':farmerId')
  @ApiOperation({ summary: '查询某用水户的当前信用分和等级及各因子明细' })
  @ApiParam({ name: 'farmerId', description: '用水户ID' })
  async getFarmerCredit(@Param('farmerId') farmerId: string) {
    try {
      return await this.service.getFarmerCreditDetail(farmerId);
    } catch (e) {
      if (e.message === '用水户不存在') throw new NotFoundException(e.message);
      throw new BadRequestException(e.message);
    }
  }

  @Get()
  @ApiOperation({ summary: '查询所有用水户信用排行(按分数降序)' })
  async getCreditRanking() {
    return this.service.getCreditRanking();
  }

  @Post(':farmerId/adjust')
  @ApiOperation({ summary: '手动调整某用水户信用分(管理员加减分并填原因,调整记录留痕)' })
  @ApiParam({ name: 'farmerId', description: '用水户ID' })
  async adjustCreditScore(
    @Param('farmerId') farmerId: string,
    @Body() dto: AdjustCreditScoreDto,
  ) {
    try {
      return await this.service.adjustCreditScore(farmerId, dto);
    } catch (e) {
      if (e.message === '用水户不存在') throw new NotFoundException(e.message);
      throw new BadRequestException(e.message);
    }
  }

  @Get(':farmerId/history')
  @ApiOperation({ summary: '查询某用水户的信用变动历史(每次重算和手动调整的记录)' })
  @ApiParam({ name: 'farmerId', description: '用水户ID' })
  @ApiQuery({ name: 'page', description: '页码(从1开始)', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', description: '每页条数', required: false, type: Number })
  async getCreditHistory(
    @Param('farmerId') farmerId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const dto: GetCreditHistoryDto = {
      farmerId,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    };
    try {
      return await this.service.getCreditHistory(dto);
    } catch (e) {
      if (e.message === '用水户不存在') throw new NotFoundException(e.message);
      throw new BadRequestException(e.message);
    }
  }

  @Post('recalculate')
  @ApiOperation({ summary: '触发全量信用重算(不等每月1号,手动跑一次)' })
  async triggerRecalculate() {
    return this.service.recalculateAll();
  }
}
