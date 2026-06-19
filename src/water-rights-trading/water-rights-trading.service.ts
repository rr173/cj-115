import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WaterBillingService } from '../water-billing/water-billing.service';
import { QuotaService } from '../quota/quota.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';
import { ApplicationStatus, QuotaQuarter, SellOrderStatus, SellOrderStatusNames } from '../common/enums';
import {
  CreateSellOrderDto,
  BuySellOrderDto,
  GetMarketSellOrdersDto,
  GetTradeHistoryDto,
  GetWaterRightsAccountDto,
} from './dto';

const SELL_ORDER_EXPIRE_DAYS = 7;
const PRICE_MIN_RATIO = 0.5;
const PRICE_MAX_RATIO = 3.0;

function monthToQuarter(month: number): QuotaQuarter {
  if (month <= 3) return QuotaQuarter.Q1;
  if (month <= 6) return QuotaQuarter.Q2;
  if (month <= 9) return QuotaQuarter.Q3;
  return QuotaQuarter.Q4;
}

@Injectable()
export class WaterRightsTradingService {
  constructor(
    private prisma: PrismaService,
    private waterBillingService: WaterBillingService,
    private quotaService: QuotaService,
  ) {}

  async ensureWaterRightsAccount(farmerId: string, year: number, quarter: string) {
    const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId } });
    if (!farmer) throw new NotFoundException('用水户不存在');

    const quota = await this.quotaService.getFarmerQuota(farmerId, year, quarter);
    if (!quota) throw new BadRequestException(`${year}年${quarter}季度定额尚未设置,无法创建水权账户`);

    const initialQuota = farmer.area * quota.amount;

    const existing = await this.prisma.waterRightsAccount.findUnique({
      where: { farmerId_year_quarter: { farmerId, year, quarter: quarter as any } },
    });

    if (existing) {
      const needsUpdate = existing.initialQuota !== initialQuota;
      if (needsUpdate) {
        return this.prisma.waterRightsAccount.update({
          where: { id: existing.id },
          data: { initialQuota, updatedAt: new Date() },
        });
      }
      return existing;
    }

    return this.prisma.waterRightsAccount.create({
      data: { farmerId, year, quarter: quarter as any, initialQuota },
    });
  }

  async getAvailableQuota(farmerId: string, year: number, quarter: string): Promise<number> {
    const account = await this.prisma.waterRightsAccount.findUnique({
      where: { farmerId_year_quarter: { farmerId, year, quarter: quarter as any } },
    });

    if (!account) {
      const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId } });
      if (!farmer) throw new NotFoundException('用水户不存在');
      const quota = await this.quotaService.getFarmerQuota(farmerId, year, quarter);
      if (!quota) return 0;
      return farmer.area * quota.amount;
    }

    const usedVolume = await this.calculateUsedVolume(farmerId, year, quarter);
    const available = account.initialQuota + account.boughtVolume - account.soldVolume - usedVolume - account.frozenVolume;
    return Math.max(0, available);
  }

  async calculateUsedVolume(farmerId: string, year: number, quarter: string): Promise<number> {
    const quarterMonths: Record<string, number[]> = {
      Q1: [1, 2, 3],
      Q2: [4, 5, 6],
      Q3: [7, 8, 9],
      Q4: [10, 11, 12],
    };
    const months = quarterMonths[quarter];
    if (!months) return 0;

    const apps = await this.prisma.waterApplication.findMany({
      where: {
        farmerId,
        status: { in: [ApplicationStatus.SCHEDULED, ApplicationStatus.EXECUTED] },
      },
      select: { requestVolume: true, targetDate: true },
    });

    let total = 0;
    for (const app of apps) {
      const d = dayjs(app.targetDate);
      if (d.year() === year && months.includes(d.month() + 1)) {
        total += app.requestVolume;
      }
    }
    return total;
  }

  async createSellOrder(dto: CreateSellOrderDto) {
    const farmer = await this.prisma.farmer.findUnique({ where: { id: dto.sellerId } });
    if (!farmer) throw new NotFoundException('用水户不存在');

    const schemeResult = await this.waterBillingService.findApplicableSchemeForFarmer(dto.sellerId);
    if (!schemeResult) throw new BadRequestException('该用水户未绑定水价方案,无法挂牌交易');

    const { scheme } = schemeResult;
    const minPrice = scheme.basePrice * PRICE_MIN_RATIO;
    const maxPrice = scheme.basePrice * PRICE_MAX_RATIO;

    if (dto.unitPrice < minPrice) {
      throw new BadRequestException(`单价不能低于基准水价的50%(最低${minPrice.toFixed(2)}元/m³)`);
    }
    if (dto.unitPrice > maxPrice) {
      throw new BadRequestException(`单价不能高于基准水价的3倍(最高${maxPrice.toFixed(2)}元/m³)`);
    }

    const account = await this.ensureWaterRightsAccount(dto.sellerId, dto.year, dto.quarter);

    const usedVolume = await this.calculateUsedVolume(dto.sellerId, dto.year, dto.quarter);
    const available = account.initialQuota + account.boughtVolume - account.soldVolume - usedVolume - account.frozenVolume;

    if (dto.sellVolume > available) {
      throw new BadRequestException(
        `出售量(${dto.sellVolume}m³)超过可用额度(${available.toFixed(2)}m³),可用=初始额度(${account.initialQuota})+买入(${account.boughtVolume})-已用(${usedVolume.toFixed(2)})-已卖出(${account.soldVolume})-冻结(${account.frozenVolume})`,
      );
    }

    if (dto.sellVolume <= 0) {
      throw new BadRequestException('出售量必须大于0');
    }

    const now = new Date();
    const expiresAt = dayjs(now).add(SELL_ORDER_EXPIRE_DAYS, 'day').toDate();

    const order = await this.prisma.$transaction(async (tx) => {
      await tx.waterRightsAccount.update({
        where: { id: account.id },
        data: {
          frozenVolume: account.frozenVolume + dto.sellVolume,
          updatedAt: new Date(),
        },
      });

      return tx.waterRightsSellOrder.create({
        data: {
          sellerId: dto.sellerId,
          year: dto.year,
          quarter: dto.quarter as any,
          sellVolume: dto.sellVolume,
          remainingVolume: dto.sellVolume,
          unitPrice: dto.unitPrice,
          status: SellOrderStatus.ACTIVE,
          expiresAt,
        },
        include: { seller: { select: { id: true, code: true, name: true } } },
      });
    });

    return {
      ...order,
      statusName: SellOrderStatusNames[order.status as SellOrderStatus],
      expiresIn: `${SELL_ORDER_EXPIRE_DAYS}天`,
    };
  }

  async buySellOrder(dto: BuySellOrderDto) {
    const order = await this.prisma.waterRightsSellOrder.findUnique({
      where: { id: dto.sellOrderId },
      include: { seller: { select: { id: true, code: true, name: true } } },
    });
    if (!order) throw new NotFoundException('卖单不存在');

    if (order.status !== SellOrderStatus.ACTIVE && order.status !== SellOrderStatus.PARTIAL) {
      throw new BadRequestException(`该卖单状态为${SellOrderStatusNames[order.status as SellOrderStatus]},无法购买`);
    }

    if (dto.buyerId === order.sellerId) {
      throw new BadRequestException('不能购买自己发布的卖单');
    }

    if (dto.buyVolume > order.remainingVolume) {
      throw new BadRequestException(`购买量(${dto.buyVolume}m³)超过卖单剩余量(${order.remainingVolume}m³)`);
    }

    if (dto.buyVolume <= 0) {
      throw new BadRequestException('购买量必须大于0');
    }

    const buyer = await this.prisma.farmer.findUnique({ where: { id: dto.buyerId } });
    if (!buyer) throw new NotFoundException('买方用水户不存在');

    const totalAmount = +(dto.buyVolume * order.unitPrice).toFixed(2);

    const trade = await this.prisma.$transaction(async (tx) => {
      const sellerAccount = await tx.waterRightsAccount.findUnique({
        where: { farmerId_year_quarter: { farmerId: order.sellerId, year: order.year, quarter: order.quarter } },
      });
      if (!sellerAccount) throw new BadRequestException('卖方水权账户不存在');

      const newFrozenVolume = Math.max(0, sellerAccount.frozenVolume - dto.buyVolume);
      await tx.waterRightsAccount.update({
        where: { id: sellerAccount.id },
        data: {
          frozenVolume: newFrozenVolume,
          soldVolume: sellerAccount.soldVolume + dto.buyVolume,
          updatedAt: new Date(),
        },
      });

      let buyerAccount = await tx.waterRightsAccount.findUnique({
        where: { farmerId_year_quarter: { farmerId: dto.buyerId, year: order.year, quarter: order.quarter } },
      });

      if (!buyerAccount) {
        const quota = await tx.quota.findUnique({
          where: { farmerId_year_quarter: { farmerId: dto.buyerId, year: order.year, quarter: order.quarter } },
        });
        if (!quota) throw new BadRequestException('买方该季度定额尚未设置');
        const bFarmer = await tx.farmer.findUnique({ where: { id: dto.buyerId }, select: { area: true } });
        buyerAccount = await tx.waterRightsAccount.create({
          data: {
            farmerId: dto.buyerId,
            year: order.year,
            quarter: order.quarter,
            initialQuota: bFarmer.area * quota.amount,
            boughtVolume: dto.buyVolume,
          },
        });
      } else {
        await tx.waterRightsAccount.update({
          where: { id: buyerAccount.id },
          data: {
            boughtVolume: buyerAccount.boughtVolume + dto.buyVolume,
            updatedAt: new Date(),
          },
        });
      }

      const newRemainingVolume = +(order.remainingVolume - dto.buyVolume).toFixed(4);
      const newStatus = newRemainingVolume <= 0.001 ? SellOrderStatus.COMPLETED : SellOrderStatus.PARTIAL;

      await tx.waterRightsSellOrder.update({
        where: { id: order.id },
        data: {
          remainingVolume: Math.max(0, newRemainingVolume),
          status: newStatus,
          updatedAt: new Date(),
        },
      });

      return tx.waterRightsTradeRecord.create({
        data: {
          sellOrderId: order.id,
          buyerId: dto.buyerId,
          sellerId: order.sellerId,
          year: order.year,
          quarter: order.quarter,
          volume: dto.buyVolume,
          unitPrice: order.unitPrice,
          totalAmount,
        },
        include: {
          buyer: { select: { id: true, code: true, name: true } },
          seller: { select: { id: true, code: true, name: true } },
        },
      });
    });

    return {
      tradeId: trade.id,
      sellOrderId: order.id,
      buyer: trade.buyer,
      seller: trade.seller,
      volume: trade.volume,
      unitPrice: trade.unitPrice,
      totalAmount: trade.totalAmount,
      year: trade.year,
      quarter: trade.quarter,
      createdAt: trade.createdAt,
    };
  }

  async cancelSellOrder(sellOrderId: string) {
    const order = await this.prisma.waterRightsSellOrder.findUnique({ where: { id: sellOrderId } });
    if (!order) throw new NotFoundException('卖单不存在');

    if (order.status !== SellOrderStatus.ACTIVE && order.status !== SellOrderStatus.PARTIAL) {
      throw new BadRequestException(`状态为${SellOrderStatusNames[order.status as SellOrderStatus]}的卖单无法撤单`);
    }

    const unfreezeVolume = order.remainingVolume;

    await this.prisma.$transaction(async (tx) => {
      await tx.waterRightsSellOrder.update({
        where: { id: sellOrderId },
        data: { status: SellOrderStatus.CANCELLED, updatedAt: new Date() },
      });

      const account = await tx.waterRightsAccount.findUnique({
        where: { farmerId_year_quarter: { farmerId: order.sellerId, year: order.year, quarter: order.quarter } },
      });
      if (account) {
        await tx.waterRightsAccount.update({
          where: { id: account.id },
          data: {
            frozenVolume: Math.max(0, account.frozenVolume - unfreezeVolume),
            updatedAt: new Date(),
          },
        });
      }
    });

    return { message: '撤单成功', unfreezeVolume };
  }

  async getMarketSellOrders(dto: GetMarketSellOrdersDto) {
    await this.expireOldOrders();

    const where: any = {
      status: { in: [SellOrderStatus.ACTIVE, SellOrderStatus.PARTIAL] },
    };
    if (dto.year) where.year = dto.year;
    if (dto.quarter) where.quarter = dto.quarter;

    const orders = await this.prisma.waterRightsSellOrder.findMany({
      where,
      include: { seller: { select: { id: true, code: true, name: true } } },
      orderBy: [{ unitPrice: 'asc' }, { createdAt: 'asc' }],
    });

    return orders.map((o) => ({
      id: o.id,
      seller: o.seller,
      year: o.year,
      quarter: o.quarter,
      sellVolume: o.sellVolume,
      remainingVolume: o.remainingVolume,
      unitPrice: o.unitPrice,
      status: o.status,
      statusName: SellOrderStatusNames[o.status as SellOrderStatus],
      createdAt: o.createdAt,
      expiresAt: o.expiresAt,
    }));
  }

  async getTradeHistory(dto: GetTradeHistoryDto) {
    const farmer = await this.prisma.farmer.findUnique({ where: { id: dto.farmerId } });
    if (!farmer) throw new NotFoundException('用水户不存在');

    const buyTrades = await this.prisma.waterRightsTradeRecord.findMany({
      where: { buyerId: dto.farmerId },
      include: {
        seller: { select: { id: true, code: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const sellTrades = await this.prisma.waterRightsTradeRecord.findMany({
      where: { sellerId: dto.farmerId },
      include: {
        buyer: { select: { id: true, code: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      farmer: { id: farmer.id, code: farmer.code, name: farmer.name },
      buyHistory: buyTrades.map((t) => ({
        id: t.id,
        sellOrderId: t.sellOrderId,
        counterparty: t.seller,
        direction: '买入',
        year: t.year,
        quarter: t.quarter,
        volume: t.volume,
        unitPrice: t.unitPrice,
        totalAmount: t.totalAmount,
        createdAt: t.createdAt,
      })),
      sellHistory: sellTrades.map((t) => ({
        id: t.id,
        sellOrderId: t.sellOrderId,
        counterparty: t.buyer,
        direction: '卖出',
        year: t.year,
        quarter: t.quarter,
        volume: t.volume,
        unitPrice: t.unitPrice,
        totalAmount: t.totalAmount,
        createdAt: t.createdAt,
      })),
    };
  }

  async getWaterRightsAccountDetail(dto: GetWaterRightsAccountDto) {
    const farmer = await this.prisma.farmer.findUnique({ where: { id: dto.farmerId } });
    if (!farmer) throw new NotFoundException('用水户不存在');

    const account = await this.prisma.waterRightsAccount.findUnique({
      where: { farmerId_year_quarter: { farmerId: dto.farmerId, year: dto.year, quarter: dto.quarter as any } },
    });

    if (!account) {
      const quota = await this.quotaService.getFarmerQuota(dto.farmerId, dto.year, dto.quarter);
      const initialQuota = quota ? farmer.area * quota.amount : 0;
      const usedVolume = await this.calculateUsedVolume(dto.farmerId, dto.year, dto.quarter);
      return {
        farmer: { id: farmer.id, code: farmer.code, name: farmer.name },
        year: dto.year,
        quarter: dto.quarter,
        initialQuota,
        boughtVolume: 0,
        soldVolume: 0,
        usedVolume: +usedVolume.toFixed(4),
        frozenVolume: 0,
        availableVolume: +Math.max(0, initialQuota - usedVolume).toFixed(4),
        accountCreated: false,
      };
    }

    const usedVolume = await this.calculateUsedVolume(dto.farmerId, dto.year, dto.quarter);
    const available = account.initialQuota + account.boughtVolume - account.soldVolume - usedVolume - account.frozenVolume;

    return {
      farmer: { id: farmer.id, code: farmer.code, name: farmer.name },
      year: dto.year,
      quarter: dto.quarter,
      initialQuota: account.initialQuota,
      boughtVolume: account.boughtVolume,
      soldVolume: account.soldVolume,
      usedVolume: +usedVolume.toFixed(4),
      frozenVolume: account.frozenVolume,
      availableVolume: +Math.max(0, available).toFixed(4),
      accountCreated: true,
    };
  }

  async expireOldOrders() {
    const now = new Date();
    const expiredOrders = await this.prisma.waterRightsSellOrder.findMany({
      where: {
        status: { in: [SellOrderStatus.ACTIVE, SellOrderStatus.PARTIAL] },
        expiresAt: { lte: now },
      },
    });

    for (const order of expiredOrders) {
      await this.prisma.$transaction(async (tx) => {
        await tx.waterRightsSellOrder.update({
          where: { id: order.id },
          data: { status: SellOrderStatus.EXPIRED, updatedAt: new Date() },
        });

        const account = await tx.waterRightsAccount.findUnique({
          where: { farmerId_year_quarter: { farmerId: order.sellerId, year: order.year, quarter: order.quarter } },
        });
        if (account) {
          await tx.waterRightsAccount.update({
            where: { id: account.id },
            data: {
              frozenVolume: Math.max(0, account.frozenVolume - order.remainingVolume),
              updatedAt: new Date(),
            },
          });
        }
      });
    }

    return { expiredCount: expiredOrders.length };
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM, { name: 'expire_water_rights_orders' })
  async handleExpireOrdersCron() {
    try {
      const result = await this.expireOldOrders();
      console.log(`[Cron] 水权交易过期检查完成, 处理${result.expiredCount}条过期卖单`);
    } catch (e) {
      console.error('[Cron] 水权交易过期检查失败:', e);
    }
  }
}
