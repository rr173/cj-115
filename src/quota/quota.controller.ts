import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { QuotaService } from './quota.service';
import { SetQuotaDto, BatchSetQuotaDto } from './dto';
import { QuotaQuarter } from '../common/enums';

@ApiTags('定额管理')
@Controller('quotas')
export class QuotaController {
  constructor(private readonly service: QuotaService) {}

  @Post()
  @ApiOperation({ summary: '设置用水户季度亩均定额,调低时自动裁减超量申请' })
  setQuota(@Body() dto: SetQuotaDto) {
    return this.service.setQuota(dto);
  }

  @Post('batch')
  @ApiOperation({ summary: '批量设置用水户季度定额' })
  async batchSet(@Body() dto: BatchSetQuotaDto) {
    const results = [];
    for (const item of dto.items) {
      results.push(await this.service.setQuota(item));
    }
    return results;
  }

  @Get()
  @ApiOperation({ summary: '查询所有定额配置' })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'quarter', required: false, enum: QuotaQuarter })
  findAll(@Query('year') year?: string, @Query('quarter') quarter?: string) {
    return this.service.findAll(year ? parseInt(year) : undefined, quarter);
  }

  @Get('farmer/:farmerId/status')
  @ApiOperation({ summary: '查询用水户某季度定额状态(可用总量/已申请/剩余)' })
  @ApiParam({ name: 'farmerId' })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'quarter', required: true, enum: QuotaQuarter })
  getFarmerStatus(
    @Param('farmerId') farmerId: string,
    @Query('year') year: string,
    @Query('quarter') quarter: string,
  ) {
    return this.service.getFarmerQuotaStatus(farmerId, parseInt(year), quarter);
  }
}
