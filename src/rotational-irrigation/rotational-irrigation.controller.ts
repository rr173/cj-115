import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RotationalIrrigationService } from './rotational-irrigation.service';
import { CreateIrrigationSeasonDto, CreateIrrigationRoundDto, UpdateIrrigationRoundDto } from './dto';
import { IrrigationRoundStatus, IrrigationRoundStatusNames } from '../common/enums';
import dayjs from 'dayjs';

@ApiTags('轮灌管控')
@Controller('rotational-irrigation')
export class RotationalIrrigationController {
  constructor(private readonly service: RotationalIrrigationService) {}

  @Post('seasons')
  @ApiOperation({ summary: '创建灌溉季' })
  createSeason(@Body() dto: CreateIrrigationSeasonDto) {
    return this.service.createSeason(dto);
  }

  @Get('seasons')
  @ApiOperation({ summary: '查询灌溉季列表' })
  async listSeasons() {
    const seasons = await this.service.listSeasons();
    return seasons.map((s) => ({
      ...s,
      rounds: s.rounds.map((r) => ({
        ...r,
        status: this.service.computeRoundStatus(r.startDate, r.endDate),
        statusName: IrrigationRoundStatusNames[this.service.computeRoundStatus(r.startDate, r.endDate)],
      })),
    }));
  }

  @Get('seasons/:id')
  @ApiOperation({ summary: '查询灌溉季详情' })
  @ApiParam({ name: 'id' })
  async getSeason(@Param('id') id: string) {
    const season = await this.service.getSeason(id);
    return {
      ...season,
      rounds: season.rounds.map((r) => ({
        ...r,
        status: this.service.computeRoundStatus(r.startDate, r.endDate),
        statusName: IrrigationRoundStatusNames[this.service.computeRoundStatus(r.startDate, r.endDate)],
      })),
    };
  }

  @Delete('seasons/:id')
  @ApiOperation({ summary: '删除灌溉季' })
  @ApiParam({ name: 'id' })
  removeSeason(@Param('id') id: string) {
    return this.service.removeSeason(id);
  }

  @Post('rounds')
  @ApiOperation({ summary: '创建轮次(自动展开子渠道,校验日期不重叠、渠道不重复)' })
  async createRound(@Body() dto: CreateIrrigationRoundDto) {
    const round = await this.service.createRound(dto);
    return {
      ...round,
      status: this.service.computeRoundStatus(round.startDate, round.endDate),
      statusName: IrrigationRoundStatusNames[this.service.computeRoundStatus(round.startDate, round.endDate)],
    };
  }

  @Put('rounds/:id')
  @ApiOperation({ summary: '更新轮次' })
  @ApiParam({ name: 'id' })
  async updateRound(@Param('id') id: string, @Body() dto: UpdateIrrigationRoundDto) {
    const round = await this.service.updateRound(id, dto);
    return {
      ...round,
      status: this.service.computeRoundStatus(round.startDate, round.endDate),
      statusName: IrrigationRoundStatusNames[this.service.computeRoundStatus(round.startDate, round.endDate)],
    };
  }

  @Get('rounds')
  @ApiOperation({ summary: '查询轮次列表(状态自动计算)' })
  @ApiQuery({ name: 'seasonId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: IrrigationRoundStatus })
  async listRounds(
    @Query('seasonId') seasonId?: string,
    @Query('status') status?: IrrigationRoundStatus,
  ) {
    const rounds = await this.service.listRounds(seasonId, status);
    return rounds.map((r) => ({
      ...r,
      status: this.service.computeRoundStatus(r.startDate, r.endDate),
      statusName: IrrigationRoundStatusNames[this.service.computeRoundStatus(r.startDate, r.endDate)],
    }));
  }

  @Get('rounds/:id')
  @ApiOperation({ summary: '查询轮次详情' })
  @ApiParam({ name: 'id' })
  async getRound(@Param('id') id: string) {
    const round = await this.service.getRound(id);
    return {
      ...round,
      status: this.service.computeRoundStatus(round.startDate, round.endDate),
      statusName: IrrigationRoundStatusNames[this.service.computeRoundStatus(round.startDate, round.endDate)],
    };
  }

  @Delete('rounds/:id')
  @ApiOperation({ summary: '删除轮次' })
  @ApiParam({ name: 'id' })
  removeRound(@Param('id') id: string) {
    return this.service.removeRound(id);
  }

  @Get('rounds/:id/water-usage')
  @ApiOperation({ summary: '查询轮次水量使用情况(已用量、剩余量、进度百分比、预警等级)' })
  @ApiParam({ name: 'id' })
  getRoundWaterUsage(@Param('id') id: string) {
    return this.service.getRoundWaterUsage(id);
  }

  @Get('rounds/:id/summary')
  @ApiOperation({ summary: '轮次用水汇总(各渠道计划量、实际量、效率、是否超上限)' })
  @ApiParam({ name: 'id' })
  getRoundSummary(@Param('id') id: string) {
    return this.service.getRoundSummary(id);
  }

  @Get('farmer/:farmerId/current-round')
  @ApiOperation({ summary: '查询用水户当前/下一轮次信息' })
  @ApiParam({ name: 'farmerId' })
  async getFarmerRoundInfo(@Param('farmerId') farmerId: string) {
    const farmer = await this.service['prisma'].farmer.findUnique({
      where: { id: farmerId },
      include: { channel: true },
    });
    if (!farmer) {
      return { error: '用水户不存在' };
    }

    const activeRound = await this.service.findActiveRoundForChannel(farmer.channelId);
    const nextRound = await this.service.findNextRoundForChannel(farmer.channelId);

    return {
      farmer: { id: farmer.id, name: farmer.name, channel: farmer.channel },
      activeRound: activeRound
        ? {
            ...activeRound,
            status: this.service.computeRoundStatus(activeRound.startDate, activeRound.endDate),
            statusName: IrrigationRoundStatusNames[this.service.computeRoundStatus(activeRound.startDate, activeRound.endDate)],
          }
        : null,
      nextRound: nextRound
        ? {
            ...nextRound,
            status: this.service.computeRoundStatus(nextRound.startDate, nextRound.endDate),
            statusName: IrrigationRoundStatusNames[this.service.computeRoundStatus(nextRound.startDate, nextRound.endDate)],
            startDateText: dayjs(nextRound.startDate).format('YYYY-MM-DD'),
          }
        : null,
    };
  }
}
