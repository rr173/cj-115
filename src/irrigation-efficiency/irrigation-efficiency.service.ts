import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelService } from '../channel/channel.service';
import { CreditRatingService } from '../credit-rating/credit-rating.service';
import { ApplicationStatus, QuotaQuarter } from '../common/enums';
import { UpdateChannelCoefficientDto, QueryFarmerEfficiencyHistoryDto, TriggerAssessmentDto } from './dto';
import dayjs from 'dayjs';

const CHANNEL_ASSESSMENT_THRESHOLD = 0.05;
const FARMER_QUALIFIED_THRESHOLD = 0.10;
const FARMER_BASICALLY_THRESHOLD = 0.20;
const CREDIT_DEDUCTION_SCORE = -5;

function monthToQuarter(month: number): QuotaQuarter {
  if (month <= 3) return QuotaQuarter.Q1;
  if (month <= 6) return QuotaQuarter.Q2;
  if (month <= 9) return QuotaQuarter.Q3;
  return QuotaQuarter.Q4;
}

function quarterToMonths(quarter: QuotaQuarter): number[] {
  const map: Record<string, number[]> = {
    Q1: [1, 2, 3],
    Q2: [4, 5, 6],
    Q3: [7, 8, 9],
    Q4: [10, 11, 12],
  };
  return map[quarter] || [];
}

@Injectable()
export class IrrigationEfficiencyService {
  constructor(
    private prisma: PrismaService,
    private channelService: ChannelService,
    private creditRatingService: CreditRatingService,
  ) {}

  async getChannelCoefficient(channelId: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      select: { id: true, code: true, name: true, level: true, waterUtilizationCoefficient: true, parentId: true },
    });
    if (!channel) throw new NotFoundException('渠道不存在');

    const path = await this.channelService.getPathToRoot(channelId);
    let compositeCoefficient = 1;
    for (const ch of path) {
      compositeCoefficient *= ch.waterUtilizationCoefficient;
    }

    return {
      channel: { id: channel.id, code: channel.code, name: channel.name, level: channel.level },
      waterUtilizationCoefficient: channel.waterUtilizationCoefficient,
      compositeUtilizationCoefficient: +compositeCoefficient.toFixed(6),
      pathDetail: path.map((ch) => ({
        id: ch.id,
        code: ch.code,
        level: ch.level,
        coefficient: ch.waterUtilizationCoefficient,
      })).reverse(),
    };
  }

  async updateChannelCoefficient(channelId: string, dto: UpdateChannelCoefficientDto) {
    const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) throw new NotFoundException('渠道不存在');

    const updated = await this.prisma.channel.update({
      where: { id: channelId },
      data: { waterUtilizationCoefficient: dto.coefficient },
    });

    return {
      channelId: updated.id,
      code: updated.code,
      name: updated.name,
      previousCoefficient: channel.waterUtilizationCoefficient,
      newCoefficient: updated.waterUtilizationCoefficient,
    };
  }

  async calculateEfficiencyForApplication(applicationId: string) {
    const app = await this.prisma.waterApplication.findUnique({
      where: { id: applicationId },
      include: { farmer: { include: { channel: true } }, actualUsage: true },
    });
    if (!app) throw new NotFoundException('申请不存在');
    if (app.status !== ApplicationStatus.EXECUTED) {
      throw new BadRequestException('只有已执行(EXECUTED)状态的申请才能计算灌溉效率');
    }

    const path = await this.channelService.getPathToRoot(app.farmer.channelId);
    let compositeCoefficient = 1;
    for (const ch of path) {
      compositeCoefficient *= ch.waterUtilizationCoefficient;
    }

    const plannedVolume = app.requestVolume;
    const theoreticalLossVolume = plannedVolume * (1 - compositeCoefficient);
    const theoreticalFieldVolume = plannedVolume * compositeCoefficient;

    let actualUsageVolume: number | null = null;
    let efficiencyDeviationRate: number | null = null;
    if (app.actualUsage) {
      actualUsageVolume = app.actualUsage.actualVolume;
      efficiencyDeviationRate = (actualUsageVolume - theoreticalFieldVolume) / theoreticalFieldVolume;
    }

    const existing = await this.prisma.irrigationEfficiencyRecord.findUnique({
      where: { applicationId },
    });

    const record = await this.prisma.irrigationEfficiencyRecord.upsert({
      where: { applicationId },
      update: {
        theoreticalLossVolume,
        theoreticalFieldVolume,
        actualUsageVolume,
        efficiencyDeviationRate,
        compositeUtilizationCoefficient: compositeCoefficient,
      },
      create: {
        applicationId,
        farmerId: app.farmerId,
        channelId: app.farmer.channelId,
        plannedVolume,
        theoreticalLossVolume,
        theoreticalFieldVolume,
        actualUsageVolume,
        efficiencyDeviationRate,
        compositeUtilizationCoefficient: compositeCoefficient,
      },
    });

    return {
      applicationId,
      farmer: { id: app.farmerId, code: app.farmer.code, name: app.farmer.name },
      channel: { id: app.farmer.channelId, code: app.farmer.channel.code, name: app.farmer.channel.name },
      plannedVolume,
      theoreticalLossVolume: +theoreticalLossVolume.toFixed(2),
      theoreticalFieldVolume: +theoreticalFieldVolume.toFixed(2),
      actualUsageVolume: actualUsageVolume !== null ? +actualUsageVolume.toFixed(2) : null,
      efficiencyDeviationRate: efficiencyDeviationRate !== null ? +(efficiencyDeviationRate * 100).toFixed(2) : null,
      compositeUtilizationCoefficient: +compositeCoefficient.toFixed(6),
      pathDetail: path.map((ch) => ({
        id: ch.id,
        code: ch.code,
        level: ch.level,
        coefficient: ch.waterUtilizationCoefficient,
      })).reverse(),
    };
  }

  async getAllocationEfficiencyDetail(applicationId: string) {
    const existing = await this.prisma.irrigationEfficiencyRecord.findUnique({
      where: { applicationId },
      include: {
        application: { include: { farmer: { select: { id: true, code: true, name: true } } } },
        channel: { select: { id: true, code: true, name: true, level: true } },
      },
    });

    if (existing) {
      return {
        applicationId: existing.applicationId,
        farmer: { id: existing.application.farmer.id, code: existing.application.farmer.code, name: existing.application.farmer.name },
        channel: { id: existing.channel.id, code: existing.channel.code, name: existing.channel.name, level: existing.channel.level },
        plannedVolume: existing.plannedVolume,
        theoreticalLossVolume: +existing.theoreticalLossVolume.toFixed(2),
        theoreticalFieldVolume: +existing.theoreticalFieldVolume.toFixed(2),
        actualUsageVolume: existing.actualUsageVolume !== null ? +existing.actualUsageVolume.toFixed(2) : null,
        efficiencyDeviationRate: existing.efficiencyDeviationRate !== null ? +(existing.efficiencyDeviationRate * 100).toFixed(2) : null,
        compositeUtilizationCoefficient: +existing.compositeUtilizationCoefficient.toFixed(6),
        createdAt: existing.createdAt,
      };
    }

    return this.calculateEfficiencyForApplication(applicationId);
  }

  async getFarmerEfficiencyHistory(dto: QueryFarmerEfficiencyHistoryDto) {
    const farmer = await this.prisma.farmer.findUnique({ where: { id: dto.farmerId } });
    if (!farmer) throw new NotFoundException('用水户不存在');

    const page = dto.page || 1;
    const pageSize = dto.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { farmerId: dto.farmerId };
    if (dto.dateFrom || dto.dateTo) {
      where.createdAt = {};
      if (dto.dateFrom) where.createdAt.gte = dayjs(dto.dateFrom).startOf('day').toDate();
      if (dto.dateTo) where.createdAt.lt = dayjs(dto.dateTo).add(1, 'day').startOf('day').toDate();
    }

    const [records, total] = await Promise.all([
      this.prisma.irrigationEfficiencyRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          application: { select: { id: true, targetDate: true } },
          channel: { select: { id: true, code: true, name: true } },
        },
      }),
      this.prisma.irrigationEfficiencyRecord.count({ where }),
    ]);

    return {
      farmer: { id: farmer.id, code: farmer.code, name: farmer.name },
      total,
      page,
      pageSize,
      records: records.map((r) => ({
        id: r.id,
        applicationId: r.applicationId,
        targetDate: dayjs(r.application.targetDate).format('YYYY-MM-DD'),
        channel: { id: r.channel.id, code: r.channel.code, name: r.channel.name },
        plannedVolume: r.plannedVolume,
        theoreticalLossVolume: +r.theoreticalLossVolume.toFixed(2),
        theoreticalFieldVolume: +r.theoreticalFieldVolume.toFixed(2),
        actualUsageVolume: r.actualUsageVolume !== null ? +r.actualUsageVolume.toFixed(2) : null,
        efficiencyDeviationRate: r.efficiencyDeviationRate !== null ? +(r.efficiencyDeviationRate * 100).toFixed(2) : null,
        compositeUtilizationCoefficient: +r.compositeUtilizationCoefficient.toFixed(6),
        createdAt: r.createdAt,
      })),
    };
  }

  async triggerQuarterlyAssessment(dto: TriggerAssessmentDto) {
    const { year, quarter } = dto;
    const months = quarterToMonths(quarter);
    if (months.length === 0) throw new BadRequestException('无效的季度');

    const quarterStart = dayjs(`${year}-${String(months[0]).padStart(2, '0')}-01`).startOf('day');
    const quarterEnd = quarterStart.add(3, 'month');

    const executedApps = await this.prisma.waterApplication.findMany({
      where: {
        status: ApplicationStatus.EXECUTED,
        targetDate: { gte: quarterStart.toDate(), lt: quarterEnd.toDate() },
      },
      include: {
        actualUsage: true,
        farmer: { include: { channel: true } },
      },
    });

    if (executedApps.length === 0) {
      throw new BadRequestException(`${year}年${quarter}季度没有已执行的配水计划,无法生成考核报告`);
    }

    for (const app of executedApps) {
      const existing = await this.prisma.irrigationEfficiencyRecord.findUnique({
        where: { applicationId: app.id },
      });
      if (!existing) {
        await this.calculateEfficiencyForApplication(app.id);
      } else if (app.actualUsage && existing.actualUsageVolume === null) {
        await this.calculateEfficiencyForApplication(app.id);
      }
    }

    const existingReport = await this.prisma.quarterlyAssessmentReport.findUnique({
      where: { year_quarter: { year, quarter } },
      include: {
        farmerAssessments: true,
      },
    });

    if (existingReport) {
      for (const fa of existingReport.farmerAssessments) {
        if (fa.creditScoreDeducted) {
          try {
            await this.creditRatingService.adjustCreditScore(fa.farmerId, {
              adjustScore: -CREDIT_DEDUCTION_SCORE,
              reason: `${year}年${quarter}季度节水考核重算,回滚上次扣减的5分`,
              operator: 'irrigation-efficiency-reassess',
            });
          } catch (e) {
            console.error(`[考核重算] 回滚用水户${fa.farmerId}信用分失败:`, e.message);
          }
        }
      }
      await this.prisma.channelQuarterlyAssessment.deleteMany({ where: { reportId: existingReport.id } });
      await this.prisma.farmerQuarterlyAssessment.deleteMany({ where: { reportId: existingReport.id } });
      await this.prisma.quarterlyAssessmentReport.delete({ where: { id: existingReport.id } });
    }

    const report = await this.prisma.quarterlyAssessmentReport.create({
      data: { year, quarter },
    });

    const channelAssessments = await this.buildChannelAssessments(report.id, year, quarter);
    const farmerAssessments = await this.buildFarmerAssessments(report.id, year, quarter);

    return {
      reportId: report.id,
      year,
      quarter,
      channelAssessmentCount: channelAssessments.length,
      channelUnqualifiedCount: channelAssessments.filter((a) => a.assessmentStatus === 'UNQUALIFIED').length,
      farmerAssessmentCount: farmerAssessments.length,
      farmerUnqualifiedCount: farmerAssessments.filter((a) => a.assessmentStatus === 'UNQUALIFIED').length,
      channelAssessments,
      farmerAssessments,
    };
  }

  private async buildChannelAssessments(reportId: string, year: number, quarter: string) {
    const months = quarterToMonths(quarter as QuotaQuarter);
    const quarterStart = dayjs(`${year}-${String(months[0]).padStart(2, '0')}-01`).startOf('day');
    const quarterEnd = quarterStart.add(3, 'month');

    const efficiencyRecords = await this.prisma.irrigationEfficiencyRecord.findMany({
      where: {
        createdAt: { gte: quarterStart.toDate(), lt: quarterEnd.toDate() },
        actualUsageVolume: { not: null },
      },
      include: {
        channel: { select: { id: true, code: true, level: true, waterUtilizationCoefficient: true } },
      },
    });

    if (efficiencyRecords.length === 0) return [];

    const channelStats = new Map<string, {
      channelId: string;
      channelCode: string;
      channelLevel: string;
      configuredCoefficient: number;
      totalPlannedVolume: number;
      totalTheoreticalFieldVolume: number;
      totalActualFieldVolume: number;
      recordCount: number;
    }>();

    for (const record of efficiencyRecords) {
      const path = await this.channelService.getPathToRoot(record.channelId);
      const pathReversed = [...path].reverse();

      let cumulativeInCoeff = 1;

      for (let i = 0; i < pathReversed.length; i++) {
        const ch = pathReversed[i];
        const chOutCoeff = cumulativeInCoeff * ch.waterUtilizationCoefficient;

        const entryVolume = record.plannedVolume * cumulativeInCoeff;
        const theoreticalFieldFromChannel = record.theoreticalFieldVolume / cumulativeInCoeff;
        const actualFieldFromChannel = (record.actualUsageVolume || 0) / cumulativeInCoeff;

        if (!channelStats.has(ch.id)) {
          channelStats.set(ch.id, {
            channelId: ch.id,
            channelCode: ch.code,
            channelLevel: ch.level,
            configuredCoefficient: ch.waterUtilizationCoefficient,
            totalPlannedVolume: 0,
            totalTheoreticalFieldVolume: 0,
            totalActualFieldVolume: 0,
            recordCount: 0,
          });
        }

        const stat = channelStats.get(ch.id)!;
        stat.totalPlannedVolume += entryVolume;
        stat.totalTheoreticalFieldVolume += theoreticalFieldFromChannel;
        stat.totalActualFieldVolume += actualFieldFromChannel;
        stat.recordCount += 1;

        cumulativeInCoeff = chOutCoeff;
      }
    }

    const results: any[] = [];

    const sortedChannels = Array.from(channelStats.values()).sort((a, b) => {
      const levelOrder = ['MAIN', 'BRANCH', 'LATERAL', 'FARM'];
      const la = levelOrder.indexOf(a.channelLevel);
      const lb = levelOrder.indexOf(b.channelLevel);
      if (la !== lb) return la - lb;
      return a.channelCode.localeCompare(b.channelCode);
    });

    for (const stat of sortedChannels) {
      const theoreticalComposite = stat.totalPlannedVolume > 0
        ? stat.totalTheoreticalFieldVolume / stat.totalPlannedVolume
        : 0;
      const actualComposite = stat.totalPlannedVolume > 0
        ? stat.totalActualFieldVolume / stat.totalPlannedVolume
        : 0;
      const deviation = actualComposite - theoreticalComposite;

      const assessmentStatus = deviation < -CHANNEL_ASSESSMENT_THRESHOLD ? 'UNQUALIFIED' : 'QUALIFIED';
      const suggestion = assessmentStatus === 'UNQUALIFIED'
        ? `实际综合利用系数(${(actualComposite * 100).toFixed(2)}%)比理论综合利用系数(${(theoreticalComposite * 100).toFixed(2)}%)低${Math.abs(deviation * 100).toFixed(2)}个百分点,建议巡检维修`
        : null;

      const saved = await this.prisma.channelQuarterlyAssessment.create({
        data: {
          reportId,
          channelId: stat.channelId,
          configuredCoefficient: stat.configuredCoefficient,
          actualLossRate: 1 - actualComposite,
          deviation,
          assessmentStatus,
          suggestion,
        },
        include: { channel: { select: { id: true, code: true, name: true, level: true } } },
      });

      results.push({
        channel: { id: saved.channel.id, code: saved.channel.code, name: saved.channel.name, level: saved.channel.level },
        configuredCoefficient: saved.configuredCoefficient,
        theoreticalCompositeCoefficient: +theoreticalComposite.toFixed(6),
        actualCompositeCoefficient: +actualComposite.toFixed(6),
        actualLossRate: +((1 - actualComposite) * 100).toFixed(2),
        deviation: +(deviation * 100).toFixed(2),
        recordCount: stat.recordCount,
        assessmentStatus: saved.assessmentStatus,
        assessmentStatusName: saved.assessmentStatus === 'QUALIFIED' ? '达标' : '效率不达标',
        suggestion: saved.suggestion,
      });
    }

    return results;
  }

  private async buildFarmerAssessments(reportId: string, year: number, quarter: string) {
    const months = quarterToMonths(quarter as QuotaQuarter);
    const quarterStart = dayjs(`${year}-${String(months[0]).padStart(2, '0')}-01`).startOf('day');
    const quarterEnd = quarterStart.add(3, 'month');

    const efficiencyRecords = await this.prisma.irrigationEfficiencyRecord.findMany({
      where: {
        createdAt: { gte: quarterStart.toDate(), lt: quarterEnd.toDate() },
        efficiencyDeviationRate: { not: null },
      },
      include: {
        farmer: { select: { id: true, code: true, name: true } },
      },
    });

    const farmerMap = new Map<string, { farmer: any; deviations: number[] }>();
    for (const record of efficiencyRecords) {
      if (record.efficiencyDeviationRate === null) continue;
      if (!farmerMap.has(record.farmerId)) {
        farmerMap.set(record.farmerId, { farmer: record.farmer, deviations: [] });
      }
      farmerMap.get(record.farmerId)!.deviations.push(record.efficiencyDeviationRate);
    }

    const results: any[] = [];

    for (const [farmerId, data] of farmerMap) {
      const avgDeviationRate = data.deviations.reduce((sum, d) => sum + d, 0) / data.deviations.length;
      const absAvg = Math.abs(avgDeviationRate);

      let assessmentStatus: string;
      let assessmentStatusName: string;
      if (absAvg < FARMER_QUALIFIED_THRESHOLD) {
        assessmentStatus = 'QUALIFIED';
        assessmentStatusName = '达标';
      } else if (absAvg < FARMER_BASICALLY_THRESHOLD) {
        assessmentStatus = 'BASICALLY_QUALIFIED';
        assessmentStatusName = '基本达标';
      } else {
        assessmentStatus = 'UNQUALIFIED';
        assessmentStatusName = '不达标';
      }

      let creditScoreDeducted = false;
      if (assessmentStatus === 'UNQUALIFIED') {
        try {
          await this.creditRatingService.adjustCreditScore(farmerId, {
            adjustScore: CREDIT_DEDUCTION_SCORE,
            reason: `${year}年${quarter}季度节水考核不达标,效率偏差率${(avgDeviationRate * 100).toFixed(2)}%超过20%阈值,扣5分`,
            operator: 'irrigation-efficiency-assessment',
          });
          creditScoreDeducted = true;
        } catch (e) {
          console.error(`[考核] 用水户${farmerId}信用扣分失败:`, e.message);
        }
      }

      const saved = await this.prisma.farmerQuarterlyAssessment.create({
        data: {
          reportId,
          farmerId,
          averageDeviationRate: avgDeviationRate,
          assessmentStatus,
          creditScoreDeducted,
        },
        include: { farmer: { select: { id: true, code: true, name: true } } },
      });

      results.push({
        farmer: { id: saved.farmer.id, code: saved.farmer.code, name: saved.farmer.name },
        averageDeviationRate: +(saved.averageDeviationRate * 100).toFixed(2),
        recordCount: data.deviations.length,
        assessmentStatus: saved.assessmentStatus,
        assessmentStatusName,
        creditScoreDeducted: saved.creditScoreDeducted,
      });
    }

    return results;
  }

  async getQuarterlyAssessment(year: number, quarter: string) {
    const report = await this.prisma.quarterlyAssessmentReport.findUnique({
      where: { year_quarter: { year, quarter } },
      include: {
        channelAssessments: {
          include: { channel: { select: { id: true, code: true, name: true, level: true } } },
          orderBy: { channelId: 'asc' },
        },
        farmerAssessments: {
          include: { farmer: { select: { id: true, code: true, name: true } } },
          orderBy: { farmerId: 'asc' },
        },
      },
    });

    if (!report) throw new NotFoundException(`${year}年${quarter}季度的考核报告不存在,请先触发考核`);

    return {
      reportId: report.id,
      year: report.year,
      quarter: report.quarter,
      createdAt: report.createdAt,
      channelAssessments: report.channelAssessments.map((a) => ({
        channel: { id: a.channel.id, code: a.channel.code, name: a.channel.name, level: a.channel.level },
        configuredCoefficient: a.configuredCoefficient,
        actualLossRate: +(a.actualLossRate * 100).toFixed(2),
        deviation: +(a.deviation * 100).toFixed(2),
        assessmentStatus: a.assessmentStatus,
        assessmentStatusName: a.assessmentStatus === 'QUALIFIED' ? '达标' : '效率不达标',
        suggestion: a.suggestion,
      })),
      farmerAssessments: report.farmerAssessments.map((a) => ({
        farmer: { id: a.farmer.id, code: a.farmer.code, name: a.farmer.name },
        averageDeviationRate: +(a.averageDeviationRate * 100).toFixed(2),
        assessmentStatus: a.assessmentStatus,
        assessmentStatusName:
          a.assessmentStatus === 'QUALIFIED' ? '达标'
          : a.assessmentStatus === 'BASICALLY_QUALIFIED' ? '基本达标'
          : '不达标',
        creditScoreDeducted: a.creditScoreDeducted,
      })),
    };
  }
}
