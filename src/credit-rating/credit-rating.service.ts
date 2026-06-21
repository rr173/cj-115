import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';
import {
  CreditLevel,
  CreditLevelNames,
  CreditHistoryType,
  QuotaQuarter,
  WaterBillStatus,
  ApplicationStatus,
} from '../common/enums';
import { AdjustCreditScoreDto, GetCreditHistoryDto } from './dto';

const INITIAL_SCORE = 60;
const BASE_MAX_SCORE = 20;
const PAYMENT_MAX_SCORE = 30;
const DEVIATION_MAX_SCORE = 20;
const OVERUSE_MAX_SCORE = 20;
const TRADING_ACTIVE_SCORE = 10;
const TRADING_INACTIVE_SCORE = 5;
const DEBT_PENALTY = 20;

function monthToQuarter(month: number): QuotaQuarter {
  if (month <= 3) return QuotaQuarter.Q1;
  if (month <= 6) return QuotaQuarter.Q2;
  if (month <= 9) return QuotaQuarter.Q3;
  return QuotaQuarter.Q4;
}

function scoreToLevel(score: number): CreditLevel {
  if (score >= 90) return CreditLevel.A;
  if (score >= 70) return CreditLevel.B;
  if (score >= 50) return CreditLevel.C;
  return CreditLevel.D;
}

@Injectable()
export class CreditRatingService {
  constructor(private prisma: PrismaService) {}

  async ensureFarmerCredit(farmerId: string) {
    const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId } });
    if (!farmer) throw new NotFoundException('用水户不存在');

    let credit = await this.prisma.farmerCredit.findUnique({ where: { farmerId } });
    if (!credit) {
      credit = await this.prisma.farmerCredit.create({
        data: {
          farmerId,
          score: INITIAL_SCORE,
          level: scoreToLevel(INITIAL_SCORE),
          baseScore: BASE_MAX_SCORE,
          paymentScore: 0,
          deviationScore: 0,
          overuseScore: 0,
          tradingScore: TRADING_INACTIVE_SCORE,
          hasUnpaidDebt: false,
          debtPenalty: 0,
        },
      });
    }
    return credit;
  }

  async getFarmerCreditDetail(farmerId: string) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { id: farmerId },
      select: { id: true, code: true, name: true, channelId: true, area: true },
    });
    if (!farmer) throw new NotFoundException('用水户不存在');

    const credit = await this.ensureFarmerCredit(farmerId);

    return {
      farmer: { id: farmer.id, code: farmer.code, name: farmer.name },
      score: credit.score,
      level: credit.level,
      levelName: CreditLevelNames[credit.level as CreditLevel],
      factors: {
        baseCredit: {
          score: credit.baseScore,
          maxScore: BASE_MAX_SCORE,
          description: '基础信用分(系统基准)',
        },
        paymentTimeliness: {
          score: credit.paymentScore,
          maxScore: PAYMENT_MAX_SCORE,
          description: '缴费及时率(当季按时缴清占比)',
        },
        usageDeviation: {
          score: credit.deviationScore,
          maxScore: DEVIATION_MAX_SCORE,
          description: '用水偏差率(当季平均偏差率)',
        },
        overuseRecord: {
          score: credit.overuseScore,
          maxScore: OVERUSE_MAX_SCORE,
          description: '超用记录(当季超用次数)',
        },
        tradingActivity: {
          score: credit.tradingScore,
          maxScore: TRADING_ACTIVE_SCORE,
          description: '水权交易活跃度(当季有无交易)',
        },
      },
      hasUnpaidDebt: credit.hasUnpaidDebt,
      debtPenalty: credit.debtPenalty,
      lastCalcAt: credit.lastCalcAt,
    };
  }

  async getCreditRanking() {
    const farmers = await this.prisma.farmer.findMany({
      select: { id: true, code: true, name: true },
    });

    const ranking = [];
    for (const farmer of farmers) {
      const credit = await this.ensureFarmerCredit(farmer.id);
      ranking.push({
        farmerId: farmer.id,
        farmerCode: farmer.code,
        farmerName: farmer.name,
        score: credit.score,
        level: credit.level,
        levelName: CreditLevelNames[credit.level as CreditLevel],
      });
    }

    ranking.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.farmerCode.localeCompare(b.farmerCode);
    });

    return {
      total: ranking.length,
      ranking: ranking.map((r, idx) => ({ ...r, rank: idx + 1 })),
    };
  }

  async adjustCreditScore(farmerId: string, dto: AdjustCreditScoreDto) {
    const credit = await this.ensureFarmerCredit(farmerId);

    const previousScore = credit.score;
    const previousLevel = credit.level;
    const newScore = Math.max(0, Math.min(100, previousScore + dto.adjustScore));
    const newLevel = scoreToLevel(newScore);

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedCredit = await tx.farmerCredit.update({
        where: { id: credit.id },
        data: {
          score: newScore,
          level: newLevel,
          updatedAt: new Date(),
        },
      });

      await tx.creditScoreHistory.create({
        data: {
          farmerId,
          type: CreditHistoryType.MANUAL,
          previousScore,
          newScore,
          previousLevel,
          newLevel,
          baseScore: credit.baseScore,
          paymentScore: credit.paymentScore,
          deviationScore: credit.deviationScore,
          overuseScore: credit.overuseScore,
          tradingScore: credit.tradingScore,
          hasUnpaidDebt: credit.hasUnpaidDebt,
          debtPenalty: credit.debtPenalty,
          reason: dto.reason,
          operator: dto.operator || 'admin',
        },
      });

      return updatedCredit;
    });

    return {
      farmerId,
      previousScore,
      newScore: updated.score,
      previousLevel,
      newLevel: updated.level,
      newLevelName: CreditLevelNames[updated.level as CreditLevel],
      adjustScore: dto.adjustScore,
      reason: dto.reason,
      operator: dto.operator || 'admin',
    };
  }

  async getCreditHistory(dto: GetCreditHistoryDto) {
    const farmer = await this.prisma.farmer.findUnique({ where: { id: dto.farmerId } });
    if (!farmer) throw new NotFoundException('用水户不存在');

    const page = dto.page || 1;
    const pageSize = dto.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [records, total] = await Promise.all([
      this.prisma.creditScoreHistory.findMany({
        where: { farmerId: dto.farmerId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.creditScoreHistory.count({
        where: { farmerId: dto.farmerId },
      }),
    ]);

    return {
      farmer: { id: farmer.id, code: farmer.code, name: farmer.name },
      total,
      page,
      pageSize,
      records: records.map((r) => ({
        id: r.id,
        type: r.type,
        typeName: r.type === CreditHistoryType.RECALC ? '系统重算' : '手动调整',
        previousScore: r.previousScore,
        newScore: r.newScore,
        scoreChange: r.newScore - r.previousScore,
        previousLevel: r.previousLevel,
        newLevel: r.newLevel,
        factors: {
          baseScore: r.baseScore,
          paymentScore: r.paymentScore,
          deviationScore: r.deviationScore,
          overuseScore: r.overuseScore,
          tradingScore: r.tradingScore,
        },
        hasUnpaidDebt: r.hasUnpaidDebt,
        debtPenalty: r.debtPenalty,
        reason: r.reason,
        operator: r.operator,
        createdAt: r.createdAt,
      })),
    };
  }

  async recalculateAll() {
    const farmers = await this.prisma.farmer.findMany({
      select: { id: true },
    });

    const results = [];
    for (const farmer of farmers) {
      const result = await this.recalculateFarmerScore(farmer.id);
      results.push(result);
    }

    return {
      totalProcessed: results.length,
      results,
    };
  }

  async recalculateFarmerScore(farmerId: string) {
    const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId } });
    if (!farmer) throw new NotFoundException('用水户不存在');

    const credit = await this.ensureFarmerCredit(farmerId);
    const previousScore = credit.score;
    const previousLevel = credit.level;

    const now = dayjs();
    const currentMonth = now.month() + 1;
    const currentYear = now.year();
    const quarter = monthToQuarter(currentMonth);

    const quarterMonths: Record<string, number[]> = {
      Q1: [1, 2, 3],
      Q2: [4, 5, 6],
      Q3: [7, 8, 9],
      Q4: [10, 11, 12],
    };
    const months = quarterMonths[quarter] || [];

    const quarterStart = dayjs(`${currentYear}-${String(months[0]).padStart(2, '0')}-01`).startOf('day');
    const quarterEnd = quarterStart.add(3, 'month');

    const baseScore = BASE_MAX_SCORE;
    const paymentScore = await this.calcPaymentScore(farmerId, currentYear, months);
    const deviationScore = await this.calcDeviationScore(farmerId, currentYear, months);
    const overuseScore = await this.calcOveruseScore(farmerId, currentYear, months);
    const tradingScore = await this.calcTradingScore(farmerId, currentYear, quarter);

    const hasUnpaidDebt = await this.checkUnpaidDebt(farmerId);
    const debtPenalty = hasUnpaidDebt ? DEBT_PENALTY : 0;

    const rawScore = baseScore + paymentScore + deviationScore + overuseScore + tradingScore - debtPenalty;
    const newScore = Math.max(0, Math.min(100, rawScore));
    const newLevel = scoreToLevel(newScore);

    await this.prisma.$transaction(async (tx) => {
      await tx.farmerCredit.update({
        where: { id: credit.id },
        data: {
          score: newScore,
          level: newLevel,
          baseScore,
          paymentScore,
          deviationScore,
          overuseScore,
          tradingScore,
          hasUnpaidDebt,
          debtPenalty,
          lastCalcAt: now.toDate(),
          updatedAt: now.toDate(),
        },
      });

      await tx.creditScoreHistory.create({
        data: {
          farmerId,
          type: CreditHistoryType.RECALC,
          previousScore,
          newScore,
          previousLevel,
          newLevel,
          baseScore,
          paymentScore,
          deviationScore,
          overuseScore,
          tradingScore,
          hasUnpaidDebt,
          debtPenalty,
          reason: `${currentYear}年${quarter}季度信用分系统重算`,
        },
      });
    });

    return {
      farmerId,
      previousScore,
      newScore,
      previousLevel,
      newLevel,
      newLevelName: CreditLevelNames[newLevel],
      factors: {
        baseScore,
        paymentScore,
        deviationScore,
        overuseScore,
        tradingScore,
      },
      hasUnpaidDebt,
      debtPenalty,
    };
  }

  private async calcPaymentScore(
    farmerId: string,
    year: number,
    months: number[],
  ): Promise<number> {
    const bills = await this.prisma.waterBill.findMany({
      where: {
        farmerId,
        billingYear: year,
        billingMonth: { in: months },
      },
      include: {
        payments: { orderBy: { paidAt: 'desc' } },
      },
    });

    if (bills.length === 0) return PAYMENT_MAX_SCORE;

    let onTimeCount = 0;
    for (const bill of bills) {
      if (bill.status === WaterBillStatus.PAID && bill.payments.length > 0) {
        const lastPaymentDate = dayjs(bill.payments[0].paidAt);
        const dueDate = dayjs(bill.dueDate);
        if (lastPaymentDate.isBefore(dueDate) || lastPaymentDate.isSame(dueDate, 'day')) {
          onTimeCount++;
        }
      }
    }

    const totalBills = bills.length;
    const ratio = onTimeCount / totalBills;

    return Math.round(ratio * PAYMENT_MAX_SCORE);
  }

  private async calcDeviationScore(
    farmerId: string,
    year: number,
    months: number[],
  ): Promise<number> {
    const usages = await this.prisma.actualUsage.findMany({
      where: {
        farmerId,
        reportTime: {
          gte: dayjs(`${year}-${String(months[0]).padStart(2, '0')}-01`).toDate(),
          lt: dayjs(`${year}-${String(months[months.length - 1]).padStart(2, '0')}-01`).endOf('month').toDate(),
        },
      },
      include: { application: true },
    });

    if (usages.length === 0) return DEVIATION_MAX_SCORE;

    let totalDeviationRate = 0;
    for (const usage of usages) {
      totalDeviationRate += usage.deviationRate;
    }
    const avgDeviationRate = totalDeviationRate / usages.length;

    const deviationPercent = avgDeviationRate * 100;
    if (deviationPercent < 10) return DEVIATION_MAX_SCORE;

    const overPercent = deviationPercent - 10;
    const deductions = Math.floor(overPercent / 10);
    return Math.max(0, DEVIATION_MAX_SCORE - deductions * 5);
  }

  private async calcOveruseScore(
    farmerId: string,
    year: number,
    months: number[],
  ): Promise<number> {
    const quarterStart = dayjs(`${year}-${String(months[0]).padStart(2, '0')}-01`).startOf('day');
    const quarterEnd = quarterStart.add(3, 'month');

    const overuseCount = await this.prisma.actualUsage.count({
      where: {
        farmerId,
        isOveruse: true,
        reportTime: {
          gte: quarterStart.toDate(),
          lt: quarterEnd.toDate(),
        },
      },
    });

    return Math.max(0, OVERUSE_MAX_SCORE - overuseCount * 4);
  }

  private async calcTradingScore(
    farmerId: string,
    year: number,
    quarter: string,
  ): Promise<number> {
    const buyTrades = await this.prisma.waterRightsTradeRecord.count({
      where: {
        buyerId: farmerId,
        year,
        quarter: quarter as any,
      },
    });

    const sellTrades = await this.prisma.waterRightsTradeRecord.count({
      where: {
        sellerId: farmerId,
        year,
        quarter: quarter as any,
      },
    });

    if (buyTrades > 0 || sellTrades > 0) return TRADING_ACTIVE_SCORE;
    return TRADING_INACTIVE_SCORE;
  }

  private async checkUnpaidDebt(farmerId: string): Promise<boolean> {
    const unpaidBills = await this.prisma.waterBill.findMany({
      where: {
        farmerId,
        status: { in: [WaterBillStatus.UNPAID, WaterBillStatus.PARTIAL, WaterBillStatus.OVERDUE] },
        remainingAmount: { gt: 0 },
      },
    });
    return unpaidBills.length > 0;
  }

  async getFarmerCreditLevel(farmerId: string): Promise<CreditLevel> {
    const credit = await this.ensureFarmerCredit(farmerId);
    return credit.level as CreditLevel;
  }

  async getFarmerCreditLevelMap(farmerIds: string[]): Promise<Map<string, CreditLevel>> {
    const map = new Map<string, CreditLevel>();
    for (const id of farmerIds) {
      const credit = await this.ensureFarmerCredit(id);
      map.set(id, credit.level as CreditLevel);
    }
    return map;
  }

  async checkDFarmerCanApply(farmerId: string): Promise<{ canApply: boolean; reason?: string }> {
    const credit = await this.ensureFarmerCredit(farmerId);
    if (credit.level === CreditLevel.D) {
      const hasDebt = await this.checkUnpaidDebt(farmerId);
      if (hasDebt) {
        return {
          canApply: false,
          reason: 'D级用水户存在未缴清欠费,请先缴清欠费后再提交申请',
        };
      }
    }
    return { canApply: true };
  }

  async getQuotaMultiplier(farmerId: string): Promise<number> {
    const credit = await this.ensureFarmerCredit(farmerId);
    const level = credit.level as CreditLevel;
    const multipliers: Record<CreditLevel, number> = {
      [CreditLevel.A]: 1.1,
      [CreditLevel.B]: 1.0,
      [CreditLevel.C]: 0.95,
      [CreditLevel.D]: 0.85,
    };
    return multipliers[level];
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, { name: 'credit_score_recalc' })
  async handleMonthlyCreditRecalc() {
    try {
      const result = await this.recalculateAll();
      console.log(`[Cron] 信用分月度重算完成: 共处理${result.totalProcessed}个用水户`);
    } catch (e) {
      console.error('[Cron] 信用分月度重算失败:', e);
    }
  }
}
