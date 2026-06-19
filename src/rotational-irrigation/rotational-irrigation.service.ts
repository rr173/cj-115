import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIrrigationSeasonDto, CreateIrrigationRoundDto, UpdateIrrigationRoundDto } from './dto';
import { IrrigationRoundStatus } from '../common/enums';
import dayjs from 'dayjs';

@Injectable()
export class RotationalIrrigationService {
  constructor(private prisma: PrismaService) {}

  computeRoundStatus(startDate: Date, endDate: Date): IrrigationRoundStatus {
    const today = dayjs().startOf('day');
    const start = dayjs(startDate).startOf('day');
    const end = dayjs(endDate).startOf('day');

    if (today.isBefore(start)) return IrrigationRoundStatus.NOT_STARTED;
    if (today.isAfter(end)) return IrrigationRoundStatus.ENDED;
    return IrrigationRoundStatus.IN_PROGRESS;
  }

  private async getChannelAndDescendants(channelId: string): Promise<string[]> {
    const ids: string[] = [];
    const queue: string[] = [channelId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (ids.includes(currentId)) continue;
      ids.push(currentId);

      const children = await this.prisma.channel.findMany({
        where: { parentId: currentId },
        select: { id: true },
      });
      for (const child of children) {
        queue.push(child.id);
      }
    }

    return ids;
  }

  private async expandChannelIds(channelIds: string[]): Promise<string[]> {
    const allIds = new Set<string>();
    for (const cid of channelIds) {
      const descendants = await this.getChannelAndDescendants(cid);
      for (const id of descendants) allIds.add(id);
    }
    return Array.from(allIds);
  }

  private async checkDateOverlapInSeason(
    seasonId: string,
    startDate: Date,
    endDate: Date,
    excludeRoundId?: string,
  ): Promise<void> {
    const where: any = {
      seasonId,
      OR: [
        {
          AND: [
            { startDate: { lte: endDate } },
            { endDate: { gte: startDate } },
          ],
        },
      ],
    };
    if (excludeRoundId) where.id = { not: excludeRoundId };

    const overlapping = await this.prisma.irrigationRound.findFirst({ where });
    if (overlapping) {
      throw new BadRequestException(
        `轮次日期与同一灌溉季内的"${overlapping.name}"冲突 (${dayjs(overlapping.startDate).format('YYYY-MM-DD')} ~ ${dayjs(overlapping.endDate).format('YYYY-MM-DD')})`,
      );
    }
  }

  private async checkChannelUniqueInSeason(
    seasonId: string,
    channelIds: string[],
    excludeRoundId?: string,
  ): Promise<void> {
    const expandedIds = await this.expandChannelIds(channelIds);

    const where: any = { seasonId };
    if (excludeRoundId) where.id = { not: excludeRoundId };

    const existingRounds = await this.prisma.irrigationRound.findMany({
      where,
      include: { channels: { include: { channel: true } } },
    });

    for (const round of existingRounds) {
      for (const rc of round.channels) {
        if (expandedIds.includes(rc.channelId)) {
          throw new BadRequestException(
            `渠道"${rc.channel.code}-${rc.channel.name}"已分配给轮次"${round.name}",同一条渠道只能出现在一个轮次中`,
          );
        }
      }
    }
  }

  async createSeason(dto: CreateIrrigationSeasonDto) {
    const start = dayjs(dto.startDate).startOf('day');
    const end = dayjs(dto.endDate).startOf('day');

    if (!start.isValid() || !end.isValid()) throw new BadRequestException('日期格式错误');
    if (start.isAfter(end)) throw new BadRequestException('开始日期不能晚于结束日期');

    return this.prisma.irrigationSeason.create({
      data: {
        name: dto.name,
        startDate: start.toDate(),
        endDate: end.toDate(),
      },
    });
  }

  async listSeasons() {
    return this.prisma.irrigationSeason.findMany({
      include: {
        rounds: {
          include: {
            channels: { include: { channel: { select: { id: true, code: true, name: true, level: true } } } },
          },
          orderBy: { startDate: 'asc' },
        },
      },
      orderBy: [{ startDate: 'desc' }],
    });
  }

  async getSeason(id: string) {
    const season = await this.prisma.irrigationSeason.findUnique({
      where: { id },
      include: {
        rounds: {
          include: {
            channels: { include: { channel: { select: { id: true, code: true, name: true, level: true } } } },
          },
          orderBy: { startDate: 'asc' },
        },
      },
    });
    if (!season) throw new NotFoundException('灌溉季不存在');
    return season;
  }

  async removeSeason(id: string) {
    const season = await this.prisma.irrigationSeason.findUnique({ where: { id } });
    if (!season) throw new NotFoundException('灌溉季不存在');
    return this.prisma.irrigationSeason.delete({ where: { id } });
  }

  async createRound(dto: CreateIrrigationRoundDto) {
    const season = await this.prisma.irrigationSeason.findUnique({ where: { id: dto.seasonId } });
    if (!season) throw new NotFoundException('灌溉季不存在');

    const start = dayjs(dto.startDate).startOf('day');
    const end = dayjs(dto.endDate).startOf('day');

    if (!start.isValid() || !end.isValid()) throw new BadRequestException('日期格式错误');
    if (start.isAfter(end)) throw new BadRequestException('开始日期不能晚于结束日期');

    if (start.isBefore(dayjs(season.startDate).startOf('day')) || end.isAfter(dayjs(season.endDate).startOf('day'))) {
      throw new BadRequestException(
        `轮次日期必须在灌溉季范围内 (${dayjs(season.startDate).format('YYYY-MM-DD')} ~ ${dayjs(season.endDate).format('YYYY-MM-DD')})`,
      );
    }

    for (const cid of dto.channelIds) {
      const ch = await this.prisma.channel.findUnique({ where: { id: cid } });
      if (!ch) throw new BadRequestException(`渠道ID ${cid} 不存在`);
    }

    await this.checkDateOverlapInSeason(dto.seasonId, start.toDate(), end.toDate());
    await this.checkChannelUniqueInSeason(dto.seasonId, dto.channelIds);

    const expandedIds = await this.expandChannelIds(dto.channelIds);

    return this.prisma.irrigationRound.create({
      data: {
        seasonId: dto.seasonId,
        name: dto.name,
        startDate: start.toDate(),
        endDate: end.toDate(),
        waterLimit: dto.waterLimit,
        channels: {
          create: expandedIds.map((cid) => ({ channelId: cid })),
        },
      },
      include: {
        channels: { include: { channel: { select: { id: true, code: true, name: true, level: true } } } },
      },
    });
  }

  async updateRound(id: string, dto: UpdateIrrigationRoundDto) {
    const round = await this.prisma.irrigationRound.findUnique({ where: { id } });
    if (!round) throw new NotFoundException('轮次不存在');

    let start = dayjs(round.startDate).startOf('day');
    let end = dayjs(round.endDate).startOf('day');

    if (dto.startDate !== undefined) start = dayjs(dto.startDate).startOf('day');
    if (dto.endDate !== undefined) end = dayjs(dto.endDate).startOf('day');

    if (!start.isValid() || !end.isValid()) throw new BadRequestException('日期格式错误');
    if (start.isAfter(end)) throw new BadRequestException('开始日期不能晚于结束日期');

    const season = await this.prisma.irrigationSeason.findUnique({ where: { id: round.seasonId } });
    if (season && (start.isBefore(dayjs(season.startDate).startOf('day')) || end.isAfter(dayjs(season.endDate).startOf('day')))) {
      throw new BadRequestException(
        `轮次日期必须在灌溉季范围内 (${dayjs(season.startDate).format('YYYY-MM-DD')} ~ ${dayjs(season.endDate).format('YYYY-MM-DD')})`,
      );
    }

    await this.checkDateOverlapInSeason(round.seasonId, start.toDate(), end.toDate(), id);

    if (dto.channelIds) {
      for (const cid of dto.channelIds) {
        const ch = await this.prisma.channel.findUnique({ where: { id: cid } });
        if (!ch) throw new BadRequestException(`渠道ID ${cid} 不存在`);
      }
      await this.checkChannelUniqueInSeason(round.seasonId, dto.channelIds, id);
    }

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.startDate !== undefined) data.startDate = start.toDate();
    if (dto.endDate !== undefined) data.endDate = end.toDate();
    if (dto.waterLimit !== undefined) data.waterLimit = dto.waterLimit;

    if (dto.channelIds) {
      const expandedIds = await this.expandChannelIds(dto.channelIds);
      return this.prisma.$transaction(async (tx) => {
        await tx.irrigationRoundChannel.deleteMany({ where: { roundId: id } });
        await tx.irrigationRoundChannel.createMany({
          data: expandedIds.map((cid) => ({ roundId: id, channelId: cid })),
        });
        return tx.irrigationRound.update({
          where: { id },
          data,
          include: {
            channels: { include: { channel: { select: { id: true, code: true, name: true, level: true } } } },
          },
        });
      });
    }

    return this.prisma.irrigationRound.update({
      where: { id },
      data,
      include: {
        channels: { include: { channel: { select: { id: true, code: true, name: true, level: true } } } },
      },
    });
  }

  async getRound(id: string) {
    const round = await this.prisma.irrigationRound.findUnique({
      where: { id },
      include: {
        season: true,
        channels: { include: { channel: { select: { id: true, code: true, name: true, level: true } } } },
      },
    });
    if (!round) throw new NotFoundException('轮次不存在');
    return round;
  }

  async listRounds(seasonId?: string, status?: IrrigationRoundStatus) {
    const where: any = {};
    if (seasonId) where.seasonId = seasonId;

    let rounds = await this.prisma.irrigationRound.findMany({
      where,
      include: {
        season: true,
        channels: { include: { channel: { select: { id: true, code: true, name: true, level: true } } } },
      },
      orderBy: { startDate: 'asc' },
    });

    if (status) {
      rounds = rounds.filter((r) => this.computeRoundStatus(r.startDate, r.endDate) === status);
    }

    return rounds;
  }

  async removeRound(id: string) {
    const round = await this.prisma.irrigationRound.findUnique({ where: { id } });
    if (!round) throw new NotFoundException('轮次不存在');
    return this.prisma.irrigationRound.delete({ where: { id } });
  }

  async findActiveRoundForChannel(channelId: string) {
    const today = dayjs().startOf('day').toDate();
    const tomorrow = dayjs().add(1, 'day').startOf('day').toDate();

    const roundChannels = await this.prisma.irrigationRoundChannel.findMany({
      where: { channelId },
      include: {
        round: {
          include: { season: true },
        },
      },
    });

    for (const rc of roundChannels) {
      const status = this.computeRoundStatus(rc.round.startDate, rc.round.endDate);
      if (status === IrrigationRoundStatus.IN_PROGRESS) {
        return rc.round;
      }
    }

    return null;
  }

  async findNextRoundForChannel(channelId: string) {
    const today = dayjs().startOf('day').toDate();

    const roundChannels = await this.prisma.irrigationRoundChannel.findMany({
      where: { channelId },
      include: {
        round: {
          include: { season: true },
        },
      },
    });

    const futureRounds = roundChannels
      .filter((rc) => dayjs(rc.round.startDate).startOf('day').isAfter(dayjs(today)))
      .sort((a, b) => a.round.startDate.getTime() - b.round.startDate.getTime());

    return futureRounds.length > 0 ? futureRounds[0].round : null;
  }

  async getRoundWaterUsage(roundId: string) {
    const round = await this.prisma.irrigationRound.findUnique({ where: { id: roundId } });
    if (!round) throw new NotFoundException('轮次不存在');

    const apps = await this.prisma.waterApplication.findMany({
      where: {
        roundId,
        status: { in: ['SCHEDULED', 'EXECUTED'] },
      },
      include: { actualUsage: true },
    });

    const plannedVolume = apps.reduce((sum, a) => sum + a.requestVolume, 0);
    const actualVolume = apps.reduce((sum, a) => sum + (a.actualUsage?.actualVolume || 0), 0);
    const remaining = Math.max(0, round.waterLimit - plannedVolume);
    const usagePercent = round.waterLimit > 0 ? (plannedVolume / round.waterLimit) * 100 : 0;

    let warningLevel: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
    if (usagePercent >= 100) warningLevel = 'CRITICAL';
    else if (usagePercent >= 90) warningLevel = 'WARNING';

    return {
      roundId: round.id,
      roundName: round.name,
      waterLimit: round.waterLimit,
      plannedVolume,
      actualVolume,
      remaining,
      usagePercent: +usagePercent.toFixed(2),
      warningLevel,
      applicationCount: apps.length,
    };
  }

  async getRoundSummary(roundId: string) {
    const round = await this.prisma.irrigationRound.findUnique({
      where: { id: roundId },
      include: {
        channels: {
          include: {
            channel: {
              select: { id: true, code: true, name: true, level: true },
            },
          },
        },
      },
    });
    if (!round) throw new NotFoundException('轮次不存在');

    const channelIds = round.channels.map((rc) => rc.channelId);

    const allocations = await this.prisma.waterAllocation.findMany({
      where: {
        channelId: { in: channelIds },
        application: { roundId },
      },
      include: {
        application: { include: { farmer: true, actualUsage: true } },
      },
    });

    const byChannel = new Map<string, { planned: number; actual: number; appCount: number }>();

    for (const alloc of allocations) {
      const durationHours = (new Date(alloc.endTime).getTime() - new Date(alloc.startTime).getTime()) / 3600000;
      const planned = alloc.flow * durationHours * 3600;
      const actual = alloc.application.actualUsage
        ? alloc.application.actualUsage.actualVolume * (planned / alloc.application.requestVolume)
        : 0;

      if (!byChannel.has(alloc.channelId)) {
        byChannel.set(alloc.channelId, { planned: 0, actual: 0, appCount: 0 });
      }
      const stat = byChannel.get(alloc.channelId)!;
      stat.planned += planned;
      stat.actual += actual;
      stat.appCount += 1;
    }

    const channelStats = round.channels.map((rc) => {
      const stat = byChannel.get(rc.channelId) || { planned: 0, actual: 0, appCount: 0 };
      const efficiency = stat.planned > 0 ? stat.actual / stat.planned : 0;
      return {
        channel: rc.channel,
        plannedVolume: +stat.planned.toFixed(2),
        actualVolume: +stat.actual.toFixed(2),
        efficiency: +efficiency.toFixed(4),
        applicationCount: stat.appCount,
      };
    });

    const totalPlanned = channelStats.reduce((s, c) => s + c.plannedVolume, 0);
    const totalActual = channelStats.reduce((s, c) => s + c.actualVolume, 0);
    const isOverLimit = totalPlanned > round.waterLimit;

    return {
      round: {
        id: round.id,
        name: round.name,
        startDate: round.startDate,
        endDate: round.endDate,
        waterLimit: round.waterLimit,
        status: this.computeRoundStatus(round.startDate, round.endDate),
      },
      totalPlannedVolume: +totalPlanned.toFixed(2),
      totalActualVolume: +totalActual.toFixed(2),
      overallEfficiency: totalPlanned > 0 ? +(totalActual / totalPlanned).toFixed(4) : 0,
      isOverLimit,
      overLimitAmount: isOverLimit ? +(totalPlanned - round.waterLimit).toFixed(2) : 0,
      channelStats,
    };
  }

  async validateApplication(farmerId: string, targetDateStr: string, expectedHours: number, requestVolume: number) {
    const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId }, include: { channel: true } });
    if (!farmer) throw new NotFoundException('用水户不存在');

    const warnings: string[] = [];

    const activeRound = await this.findActiveRoundForChannel(farmer.channelId);

    if (!activeRound) {
      const nextRound = await this.findNextRoundForChannel(farmer.channelId);
      if (nextRound) {
        throw new BadRequestException(
          `当前不在您所在渠道(${farmer.channel.code})的灌溉轮次内,下一轮次为"${nextRound.name}",将于 ${dayjs(nextRound.startDate).format('YYYY-MM-DD')} 开始`,
        );
      } else {
        throw new BadRequestException(
          `当前没有为您所在渠道(${farmer.channel.code})安排灌溉轮次,请联系管理员`,
        );
      }
    }

    const targetDate = dayjs(targetDateStr).startOf('day');
    const roundEnd = dayjs(activeRound.endDate).startOf('day');
    const remainingDays = roundEnd.diff(targetDate, 'day') + 1;

    if (remainingDays < Math.ceil(expectedHours / 24)) {
      warnings.push(
        `轮次"${activeRound.name}"将于 ${dayjs(activeRound.endDate).format('YYYY-MM-DD')} 结束,剩余${remainingDays}天,您申请的${expectedHours}小时灌溉时长可能无法在本轮内完成`,
      );
    }

    const usage = await this.getRoundWaterUsage(activeRound.id);
    if (usage.warningLevel === 'CRITICAL') {
      throw new BadRequestException(
        `轮次"${activeRound.name}"已达到供水量上限(${usage.waterLimit.toFixed(0)}m³),无法继续提交申请`,
      );
    }

    if (usage.warningLevel === 'WARNING') {
      warnings.push(
        `轮次"${activeRound.name}"已使用水量的${usage.usagePercent}%,接近供水量上限(${usage.waterLimit.toFixed(0)}m³)`,
      );
    }

    return {
      roundId: activeRound.id,
      roundName: activeRound.name,
      warnings,
    };
  }
}
