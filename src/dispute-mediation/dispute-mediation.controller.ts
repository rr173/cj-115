import { Controller, Get, Post, Body, Param, Query, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DisputeMediationService } from './dispute-mediation.service';
import {
  CreateDisputeDto,
  AcceptDisputeDto,
  AddMediationRecordDto,
  CloseDisputeDto,
  QueryDisputesDto,
  QuarterlyStatsDto,
} from './dto';
import { DisputeType, DisputeStatus } from '../common/enums';

@ApiTags('用水纠纷调解与台账管理')
@Controller('dispute-mediation')
export class DisputeMediationController {
  constructor(private readonly service: DisputeMediationService) {}

  @Post()
  @ApiOperation({ summary: '登记纠纷事件' })
  create(@Body() dto: CreateDisputeDto) {
    return this.service.createDispute(dto);
  }

  @Get()
  @ApiOperation({ summary: '查询纠纷列表(支持按时间/类型/状态/超期筛选)' })
  @ApiQuery({ name: 'startDate', description: '开始日期 YYYY-MM-DD', required: false })
  @ApiQuery({ name: 'endDate', description: '结束日期 YYYY-MM-DD', required: false })
  @ApiQuery({ name: 'type', description: '纠纷类型', enum: DisputeType, required: false })
  @ApiQuery({ name: 'status', description: '状态', enum: DisputeStatus, required: false })
  @ApiQuery({ name: 'isOverdue', description: '是否超期', type: Boolean, required: false })
  @ApiQuery({ name: 'page', description: '页码', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', description: '每页条数', type: Number, required: false })
  findAll(@Query() dto: QueryDisputesDto) {
    return this.service.queryDisputes(dto);
  }

  @Get('farmer/:farmerId')
  @ApiOperation({ summary: '查询某用水户涉及的所有纠纷历史' })
  @ApiParam({ name: 'farmerId', description: '用水户ID' })
  getFarmerDisputes(@Param('farmerId') farmerId: string) {
    return this.service.getFarmerDisputes(farmerId);
  }

  @Get('statistics/quarterly')
  @ApiOperation({ summary: '按季度统计各类型纠纷数量和平均处理天数' })
  @ApiQuery({ name: 'year', description: '年份', type: Number })
  @ApiQuery({ name: 'quarter', description: '季度(Q1/Q2/Q3/Q4)' })
  getQuarterlyStats(@Query() dto: QuarterlyStatsDto) {
    return this.service.getQuarterlyStats(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询纠纷详情(含调解记录时间线和关联配水申请)' })
  @ApiParam({ name: 'id', description: '纠纷ID' })
  findOne(@Param('id') id: string) {
    return this.service.getDisputeDetail(id);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: '受理纠纷(指定调解员和预计处理天数)' })
  @ApiParam({ name: 'id', description: '纠纷ID' })
  accept(@Param('id') id: string, @Body() dto: AcceptDisputeDto) {
    return this.service.acceptDispute(id, dto);
  }

  @Post(':id/mediation-record')
  @ApiOperation({ summary: '追加调解记录' })
  @ApiParam({ name: 'id', description: '纠纷ID' })
  addMediationRecord(@Param('id') id: string, @Body() dto: AddMediationRecordDto) {
    return this.service.addMediationRecord(id, dto);
  }

  @Post(':id/close')
  @ApiOperation({ summary: '结案(填写处理结论和说明)' })
  @ApiParam({ name: 'id', description: '纠纷ID' })
  close(@Param('id') id: string, @Body() dto: CloseDisputeDto) {
    return this.service.closeDispute(id, dto);
  }

  @Post(':id/reopen')
  @ApiOperation({ summary: '重新打开纠纷(回到调解中,结案30天内可操作)' })
  @ApiParam({ name: 'id', description: '纠纷ID' })
  reopen(@Param('id') id: string) {
    return this.service.reopenDispute(id);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: '手动归档纠纷' })
  @ApiParam({ name: 'id', description: '纠纷ID' })
  archive(@Param('id') id: string) {
    return this.service.archiveDispute(id);
  }
}
