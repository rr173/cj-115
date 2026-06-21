import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuotaService } from '../quota/quota.service';
import { WaterBillingService } from '../water-billing/water-billing.service';
import { RotationalIrrigationService } from '../rotational-irrigation/rotational-irrigation.service';
import { WaterRightsTradingService } from '../water-rights-trading/water-rights-trading.service';
import { CreditRatingService } from '../credit-rating/credit-rating.service';
import { CreateApplicationDto } from './dto';
import dayjs from 'dayjs';
import { ApplicationStatus, QuotaQuarter } from '../common/enums';

function monthToQuarter(month: number): QuotaQuarter {
  if (month <= 3) return QuotaQuarter.Q1;
  if (month <= 6) return QuotaQuarter.Q2;
  if (month <= 9) return QuotaQuarter.Q3;
  return QuotaQuarter.Q4;
}

@Injectable()
export class ApplicationService {
  constructor(
    private prisma: PrismaService,
    private quotaService: QuotaService,
    @Inject(forwardRef(() => WaterBillingService))
    private waterBillingService: WaterBillingService,
    private rotationalIrrigationService: RotationalIrrigationService,
    @Inject(forwardRef(() => WaterRightsTradingService))
    private waterRightsTradingService: WaterRightsTradingService,
    @Inject(forwardRef(() => CreditRatingService))
    private creditRatingService: CreditRatingService,
  ) {}

  async create(dto: CreateApplicationDto) {
    const farmer = await this.prisma.farmer.findUnique({ where: { id: dto.farmerId } });
    if (!farmer) throw new NotFoundException('用水户不存在');

    const checkResult = await this.waterBillingService.checkFarmerCanApply(dto.farmerId);
    if (!checkResult.canApply) {
      throw new BadRequestException(`提交申请被拒绝: ${checkResult.reason}`);
    }

    const dCheck = await this.creditRatingService.checkDFarmerCanApply(dto.farmerId);
    if (!dCheck.canApply) {
      throw new BadRequestException(`提交申请被拒绝: ${dCheck.reason}`);
    }

    const target = dayjs(dto.targetDate);
    if (!target.isValid()) throw new BadRequestException('目标日期格式错误');

    const year = target.year();
    const quarter = monthToQuarter(target.month() + 1);

    const quota = await this.quotaService.getFarmerQuota(farmer.id, year, quarter);
    if (!quota) {
      throw new BadRequestException(`${year}年${quarter}季度定额尚未设置,无法提交申请`);
    }

    const creditMultiplier = await this.creditRatingService.getQuotaMultiplier(dto.farmerId);

    const requestVolume = dto.expectedFlow * dto.expectedHours * 3600;

    const availableQuota = await this.waterRightsTradingService.getAvailableQuota(farmer.id, year, quarter);

    const creditAdjustedQuota = +(availableQuota * creditMultiplier).toFixed(4);

    if (requestVolume > creditAdjustedQuota) {
      throw new BadRequestException(
        `申请量(${requestVolume.toFixed(2)}m³)超过信用调整后可用额度(${creditAdjustedQuota.toFixed(2)}m³,原额度${availableQuota.toFixed(2)}m³×信用系数${creditMultiplier}),额度不足可前往水权交易市场购买`,
      );
    }

    const channel = await this.prisma.channel.findUnique({ where: { id: farmer.channelId } });
    if (dto.expectedFlow > channel.maxFlow) {
      throw new BadRequestException(
        `申请流量(${dto.expectedFlow}m³/s)超过农渠(${channel.code})最大设计流量(${channel.maxFlow}m³/s)`,
      );
    }

    const rotationalCheck = await this.rotationalIrrigationService.validateApplication(
      dto.farmerId,
      dto.targetDate,
      dto.expectedHours,
      requestVolume,
    );

    const created = await this.prisma.waterApplication.create({
      data: {
        farmerId: dto.farmerId,
        expectedFlow: dto.expectedFlow,
        expectedHours: dto.expectedHours,
        requestVolume,
        submitTime: new Date(),
        targetDate: target.startOf('day').toDate(),
        originalTargetDate: target.startOf('day').toDate(),
        status: ApplicationStatus.PENDING,
        roundId: rotationalCheck.roundId,
      },
      include: { farmer: { include: { channel: true } } },
    });

    return {
      ...created,
      creditMultiplier,
      warnings: rotationalCheck.warnings,
      roundName: rotationalCheck.roundName,
    };
  }

  async findAll(farmerId?: string, targetDate?: string, status?: string) {
    const where: any = {};
    if (farmerId) where.farmerId = farmerId;
    if (targetDate) {
      const d = dayjs(targetDate).startOf('day');
      where.targetDate = {
        gte: d.toDate(),
        lt: d.add(1, 'day').toDate(),
      };
    }
    if (status) where.status = status;
    return this.prisma.waterApplication.findMany({
      where,
      include: {
        farmer: { select: { id: true, code: true, name: true, channel: { select: { id: true, code: true, name: true } } } },
        allocations: { include: { channel: { select: { id: true, code: true, name: true } } } },
        actualUsage: true,
      },
      orderBy: [{ targetDate: 'asc' }, { submitTime: 'asc' }],
    });
  }

  async findOne(id: string) {
    const app = await this.prisma.waterApplication.findUnique({
      where: { id },
      include: {
        farmer: { include: { channel: true } },
        allocations: { include: { channel: true } },
        actualUsage: true,
      },
    });
    if (!app) throw new NotFoundException('申请不存在');
    return app;
  }

  async getFarmerApplications(farmerId: string) {
    return this.prisma.waterApplication.findMany({
      where: { farmerId },
      include: {
        allocations: { include: { channel: { select: { id: true, code: true, name: true } } } },
        actualUsage: true,
      },
      orderBy: { submitTime: 'desc' },
    });
  }

  async cancel(id: string) {
    const app = await this.prisma.waterApplication.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('申请不存在');
    if (app.status === ApplicationStatus.EXECUTED) {
      throw new BadRequestException('已执行的申请无法取消');
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.waterAllocation.deleteMany({ where: { applicationId: id } });
      return tx.waterApplication.update({
        where: { id },
        data: { status: ApplicationStatus.CANCELLED_QUOTA, failReason: '用户取消' },
      });
    });
  }
}
