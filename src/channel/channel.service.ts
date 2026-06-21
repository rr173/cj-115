import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChannelDto, UpdateChannelDto } from './dto';
import { ChannelLevel } from '../common/enums';

const FLOW_SPEED = 0.8;

function calcPropagationDelay(length: number): number {
  return Math.floor(length / FLOW_SPEED / 60);
}

@Injectable()
export class ChannelService {
  constructor(private prisma: PrismaService) {}

  private async validateTree(parentId: string | null, level: ChannelLevel) {
    if (level === ChannelLevel.MAIN) {
      const existingMain = await this.prisma.channel.findFirst({
        where: { level: ChannelLevel.MAIN },
      });
      if (existingMain) {
        throw new BadRequestException('干渠有且只有1条');
      }
      if (parentId) {
        throw new BadRequestException('干渠不能有上级渠道');
      }
      return;
    }

    if (!parentId) {
      throw new BadRequestException('非干渠必须指定上级渠道');
    }

    const parent = await this.prisma.channel.findUnique({ where: { id: parentId } });
    if (!parent) {
      throw new BadRequestException('上级渠道不存在');
    }

    const levelOrder = { MAIN: 0, BRANCH: 1, LATERAL: 2, FARM: 3 };
    if (levelOrder[parent.level] >= levelOrder[level]) {
      throw new BadRequestException('渠道级别必须低于上级渠道');
    }

    await this.detectCycle(parentId);
  }

  private async detectCycle(startId: string) {
    const visited = new Set<string>();
    let current: { id: string; parentId: string | null } | null = { id: startId, parentId: null };
    while (current) {
      if (visited.has(current.id)) {
        throw new BadRequestException('渠道树存在环');
      }
      visited.add(current.id);
      current = current.parentId
        ? await this.prisma.channel.findUnique({
            where: { id: current.parentId },
            select: { id: true, parentId: true },
          })
        : null;
    }
  }

  async create(dto: CreateChannelDto) {
    await this.validateTree(dto.parentId ?? null, dto.level);

    if (dto.parentId) {
      const siblings = await this.prisma.channel.findMany({ where: { parentId: dto.parentId } });
      if (siblings.some((s) => s.code === dto.code)) {
        throw new BadRequestException('同级渠道编号重复');
      }
    } else {
      const exist = await this.prisma.channel.findUnique({ where: { code: dto.code } });
      if (exist) throw new BadRequestException('渠道编号已存在');
    }

    return this.prisma.channel.create({
      data: {
        ...dto,
        propagationDelay: calcPropagationDelay(dto.length),
      },
    });
  }

  async findAll() {
    return this.prisma.channel.findMany({
      include: { children: true, parent: { select: { id: true, code: true, name: true } } },
      orderBy: [{ level: 'asc' }, { code: 'asc' }],
    });
  }

  async findOne(id: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id },
      include: { children: true, parent: true, farmers: true },
    });
    if (!channel) throw new NotFoundException('渠道不存在');
    return channel;
  }

  async findByCode(code: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { code },
      include: { parent: true },
    });
    if (!channel) throw new NotFoundException('渠道不存在');
    return channel;
  }

  async update(id: string, dto: UpdateChannelDto) {
    const channel = await this.prisma.channel.findUnique({ where: { id } });
    if (!channel) throw new NotFoundException('渠道不存在');

    const data: any = { ...dto };
    if (dto.length !== undefined) {
      data.propagationDelay = calcPropagationDelay(dto.length);
    }

    return this.prisma.channel.update({ where: { id }, data });
  }

  async remove(id: string) {
    const channel = await this.prisma.channel.findUnique({ where: { id } });
    if (!channel) throw new NotFoundException('渠道不存在');
    return this.prisma.channel.delete({ where: { id } });
  }

  async getPathToRoot(channelId: string): Promise<Array<{ id: string; code: string; level: ChannelLevel; propagationDelay: number; maxFlow: number; waterUtilizationCoefficient: number }>> {
    const path: Array<{ id: string; code: string; level: ChannelLevel; propagationDelay: number; maxFlow: number; waterUtilizationCoefficient: number }> = [];
    let currentId: string | null = channelId;
    while (currentId) {
      const ch = await this.prisma.channel.findUnique({
        where: { id: currentId },
        select: { id: true, code: true, level: true, propagationDelay: true, maxFlow: true, waterUtilizationCoefficient: true, parentId: true },
      });
      if (!ch) break;
      path.push({ id: ch.id, code: ch.code, level: ch.level as ChannelLevel, propagationDelay: ch.propagationDelay, maxFlow: ch.maxFlow, waterUtilizationCoefficient: ch.waterUtilizationCoefficient });
      currentId = ch.parentId;
    }
    return path;
  }
}
