import { Controller, Get, Post, Param, Body, Query, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EmergencyApplicationService } from './emergency-application.service';
import { EmergencyApprovalDto, ListEmergencyApplicationsDto, EmergencyStatisticsDto } from './dto';
import { EmergencyApprovalStatus } from '../common/enums';

@ApiTags('紧急用水申请')
@Controller('emergency-applications')
export class EmergencyApplicationController {
  constructor(private readonly service: EmergencyApplicationService) {}

  @Get()
  @ApiOperation({ summary: '查询紧急申请列表(按状态筛选)' })
  @ApiQuery({ name: 'status', required: false, enum: EmergencyApprovalStatus, description: '审批状态 PENDING_APPROVAL-待审批 APPROVED-已批准 REJECTED-已驳回 TO_BE_TRACED-待追溯' })
  @ApiQuery({ name: 'farmerId', required: false, description: '用水户ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码(从1开始)' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数' })
  async findAll(
    @Query('status') status?: EmergencyApprovalStatus,
    @Query('farmerId') farmerId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const dto: ListEmergencyApplicationsDto = {
      status,
      farmerId,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    };
    return this.service.findAll(dto);
  }

  @Get('statistics')
  @ApiOperation({ summary: '按月统计紧急申请使用情况' })
  @ApiQuery({ name: 'year', required: true, description: '年份' })
  @ApiQuery({ name: 'month', required: true, description: '月份(1-12)' })
  async getStatistics(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const dto: EmergencyStatisticsDto = {
      year: parseInt(year, 10),
      month: parseInt(month, 10),
    };
    try {
      return await this.service.getMonthlyStatistics(dto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: '查询紧急申请详情' })
  @ApiParam({ name: 'id', description: '申请ID' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.service.findOne(id);
    } catch (e) {
      if (e.message === '申请不存在') throw new NotFoundException(e.message);
      throw new BadRequestException(e.message);
    }
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '审批紧急申请(批准或驳回)' })
  @ApiParam({ name: 'id', description: '申请ID' })
  async approve(
    @Param('id') id: string,
    @Body() dto: EmergencyApprovalDto,
  ) {
    try {
      return await this.service.approve(id, dto);
    } catch (e) {
      if (e.message === '申请不存在') throw new NotFoundException(e.message);
      throw new BadRequestException(e.message);
    }
  }
}
