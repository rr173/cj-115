import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { FarmerService } from './farmer.service';
import { CreateFarmerDto, UpdateFarmerDto } from './dto';

@ApiTags('用水户管理')
@Controller('farmers')
export class FarmerController {
  constructor(private readonly service: FarmerService) {}

  @Post()
  @ApiOperation({ summary: '注册用水户,关联末级农渠' })
  create(@Body() dto: CreateFarmerDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '查询所有用水户列表' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '按ID查询用水户详情' })
  @ApiParam({ name: 'id', description: '用水户ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: '按编号查询用水户' })
  @ApiParam({ name: 'code', description: '用水户编号' })
  findByCode(@Param('code') code: string) {
    return this.service.findByCode(code);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用水户信息' })
  @ApiParam({ name: 'id', description: '用水户ID' })
  update(@Param('id') id: string, @Body() dto: UpdateFarmerDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用水户' })
  @ApiParam({ name: 'id', description: '用水户ID' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
