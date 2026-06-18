import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ChannelService } from './channel.service';
import { CreateChannelDto, UpdateChannelDto } from './dto';

@ApiTags('渠网管理')
@Controller('channels')
export class ChannelController {
  constructor(private readonly service: ChannelService) {}

  @Post()
  @ApiOperation({ summary: '注册渠道(干渠/支渠/斗渠/农渠)' })
  create(@Body() dto: CreateChannelDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '查询所有渠道列表(含上下级关系)' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '按ID查询单个渠道详情' })
  @ApiParam({ name: 'id', description: '渠道ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: '按编号查询渠道' })
  @ApiParam({ name: 'code', description: '渠道编号' })
  findByCode(@Param('code') code: string) {
    return this.service.findByCode(code);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新渠道信息' })
  @ApiParam({ name: 'id', description: '渠道ID' })
  update(@Param('id') id: string, @Body() dto: UpdateChannelDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除渠道' })
  @ApiParam({ name: 'id', description: '渠道ID' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
