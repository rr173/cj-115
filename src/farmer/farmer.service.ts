import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelService } from '../channel/channel.service';
import { CreateFarmerDto, UpdateFarmerDto } from './dto';
import { ChannelLevel } from '../common/enums';

@Injectable()
export class FarmerService {
  constructor(
    private prisma: PrismaService,
    private channelService: ChannelService,
  ) {}

  async create(dto: CreateFarmerDto) {
    const exist = await this.prisma.farmer.findUnique({ where: { code: dto.code } });
    if (exist) throw new BadRequestException('用水户编号已存在');

    const channel = await this.prisma.channel.findUnique({ where: { id: dto.channelId } });
    if (!channel) throw new BadRequestException('农渠不存在');
    if (channel.level !== ChannelLevel.FARM) {
      throw new BadRequestException('用水户只能关联到末级农渠(FARM级别)');
    }

    return this.prisma.farmer.create({ data: dto, include: { channel: true } });
  }

  async findAll() {
    return this.prisma.farmer.findMany({
      include: {
        channel: { select: { id: true, code: true, name: true } },
        quotas: true,
      },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id: string) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { id },
      include: {
        channel: true,
        quotas: true,
        applications: { orderBy: { submitTime: 'desc' } },
      },
    });
    if (!farmer) throw new NotFoundException('用水户不存在');
    return farmer;
  }

  async findByCode(code: string) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { code },
      include: { channel: true, quotas: true },
    });
    if (!farmer) throw new NotFoundException('用水户不存在');
    return farmer;
  }

  async update(id: string, dto: UpdateFarmerDto) {
    const farmer = await this.prisma.farmer.findUnique({ where: { id } });
    if (!farmer) throw new NotFoundException('用水户不存在');

    if (dto.channelId) {
      const channel = await this.prisma.channel.findUnique({ where: { id: dto.channelId } });
      if (!channel) throw new BadRequestException('农渠不存在');
      if (channel.level !== ChannelLevel.FARM) {
        throw new BadRequestException('用水户只能关联到末级农渠(FARM级别)');
      }
    }

    return this.prisma.farmer.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const farmer = await this.prisma.farmer.findUnique({ where: { id } });
    if (!farmer) throw new NotFoundException('用水户不存在');
    return this.prisma.farmer.delete({ where: { id } });
  }
}
