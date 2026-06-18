import { Controller, Get, Post, Body, Param, Query, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto';
import { ApplicationStatus } from '../common/enums';

@ApiTags('用水申请')
@Controller('applications')
export class ApplicationController {
  constructor(private readonly service: ApplicationService) {}

  @Post()
  @ApiOperation({ summary: '提交用水申请(校验剩余可用量)' })
  create(@Body() dto: CreateApplicationDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '查询申请列表' })
  @ApiQuery({ name: 'farmerId', required: false })
  @ApiQuery({ name: 'targetDate', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ApplicationStatus })
  findAll(
    @Query('farmerId') farmerId?: string,
    @Query('targetDate') targetDate?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll(farmerId, targetDate, status);
  }

  @Get(':id')
  @ApiOperation({ summary: '按ID查询申请详情' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('farmer/:farmerId')
  @ApiOperation({ summary: '按用水户查询申请列表(含已安排和未安排)' })
  @ApiParam({ name: 'farmerId' })
  getFarmerApplications(@Param('farmerId') farmerId: string) {
    return this.service.getFarmerApplications(farmerId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '取消申请' })
  @ApiParam({ name: 'id' })
  cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }
}
