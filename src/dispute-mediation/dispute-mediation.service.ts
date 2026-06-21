import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditRatingService } from '../credit-rating/credit-rating.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';
import {
  DisputeType,
  DisputeTypeNames,
  DisputeStatus,
  DisputeStatusNames,
  MediationResult,
  MediationResultNames,
  QuotaQuarter,
} from '../common/enums';
import {
  CreateDisputeDto,
  AcceptDisputeDto,
  AddMediationRecordDto,
  CloseDisputeDto,
  QueryDisputesDto,
  QuarterlyStatsDto,
} from './dto';

const DISPUTE_CREDIT_PENALTY_SCORE = -3;
const DISPUTE_CREDIT_THRESHOLD = 3;
const AUTO_ARCHIVE_DAYS = 30;

function monthToQuarter(month: number): QuotaQuarter {
  if (month <= 3) return QuotaQuarter.Q1;
  if (month <= 6) return QuotaQuarter.Q2;
  if (month <= 9) return QuotaQuarter.Q3;
  return QuotaQuarter.Q4;
}

function quarterToMonths(quarter: string): number[] {
  switch (quarter) {
    case QuotaQuarter.Q1: return [1, 2, 3];
    case QuotaQuarter.Q2: return [4, 5, 6];
    case QuotaQuarter.Q3: return [7, 8, 9];
    case QuotaQuarter.Q4: return [10, 11, 12];
    default: return [];
  }
}

@Injectable()
export class DisputeMediationService {
  constructor(
    private prisma: PrismaService,
    private creditRatingService: CreditRatingService,
  ) {}

  private async generateDisputeNo(): Promise<string> {
    const now = dayjs();
    const yearMonth = now.format('YYYYMM');
    const prefix = `JF-${yearMonth}-`;

    const lastDispute = await this.prisma.disputeCase.findFirst({
      where: { disputeNo: { startsWith: prefix } },
      orderBy: { disputeNo: 'desc' },
      select: { disputeNo: true },
    });

    let seq = 1;
    if (lastDispute) {
      const lastSeq = parseInt(lastDispute.disputeNo.split('-')[2], 10);
      seq = lastSeq + 1;
    }

    return `${prefix}${String(seq).padStart(3, '0')}`;
  }

  async createDispute(dto: CreateDisputeDto) {
    if (!Object.values(DisputeType).includes(dto.type as DisputeType)) {
      throw new BadRequestException(`无效的纠纷类型: ${dto.type}`);
    }

    const farmers = await this.prisma.farmer.findMany({
      where: { id: { in: dto.farmerIds } },
      select: { id: true },
    });
    if (farmers.length !== dto.farmerIds.length) {
      throw new BadRequestException('部分用水户ID不存在');
    }

    if (dto.applicationIds && dto.applicationIds.length > 0) {
      const apps = await this.prisma.waterApplication.findMany({
        where: { id: { in: dto.applicationIds } },
        select: { id: true },
      });
      if (apps.length !== dto.applicationIds.length) {
        throw new BadRequestException('部分配水申请ID不存在');
      }
    }

    const disputeNo = await this.generateDisputeNo();

    const dispute = await this.prisma.$transaction(async (tx) => {
      const disputeCase = await tx.disputeCase.create({
        data: {
          disputeNo,
          type: dto.type,
          description: dto.description,
          occurredAt: dayjs(dto.occurredAt).toDate(),
          status: DisputeStatus.PENDING_ACCEPT,
        },
      });

      await tx.disputeFarmerLink.createMany({
        data: dto.farmerIds.map((farmerId) => ({
          disputeId: disputeCase.id,
          farmerId,
        })),
      });

      if (dto.applicationIds && dto.applicationIds.length > 0) {
        await tx.disputeApplicationLink.createMany({
          data: dto.applicationIds.map((applicationId) => ({
            disputeId: disputeCase.id,
            applicationId,
          })),
        });
      }

      return disputeCase;
    });

    await this.checkAndApplyCreditPenalty(dto.farmerIds);

    return {
      id: dispute.id,
      disputeNo: dispute.disputeNo,
      type: dispute.type,
      typeName: DisputeTypeNames[dispute.type as DisputeType],
      description: dispute.description,
      occurredAt: dispute.occurredAt,
      status: dispute.status,
      statusName: DisputeStatusNames[dispute.status as DisputeStatus],
      farmerIds: dto.farmerIds,
      applicationIds: dto.applicationIds || [],
      createdAt: dispute.createdAt,
    };
  }

  async acceptDispute(id: string, dto: AcceptDisputeDto) {
    const dispute = await this.prisma.disputeCase.findUnique({ where: { id } });
    if (!dispute) throw new NotFoundException('纠纷记录不存在');
    if (dispute.status !== DisputeStatus.PENDING_ACCEPT) {
      throw new BadRequestException('只有待受理状态的纠纷可以受理');
    }

    const updated = await this.prisma.disputeCase.update({
      where: { id },
      data: {
        status: DisputeStatus.MEDIATING,
        mediatorName: dto.mediatorName,
        expectedDays: dto.expectedDays,
        acceptedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      disputeNo: updated.disputeNo,
      status: updated.status,
      statusName: DisputeStatusNames[updated.status as DisputeStatus],
      mediatorName: updated.mediatorName,
      expectedDays: updated.expectedDays,
      acceptedAt: updated.acceptedAt,
    };
  }

  async addMediationRecord(id: string, dto: AddMediationRecordDto) {
    const dispute = await this.prisma.disputeCase.findUnique({ where: { id } });
    if (!dispute) throw new NotFoundException('纠纷记录不存在');
    if (dispute.status !== DisputeStatus.MEDIATING) {
      throw new BadRequestException('只有调解中状态的纠纷可以追加调解记录');
    }

    const record = await this.prisma.disputeMediationRecord.create({
      data: {
        disputeId: id,
        recordedAt: new Date(),
        recorderName: dto.recorderName,
        content: dto.content,
        isOnSiteInspection: dto.isOnSiteInspection ?? false,
      },
    });

    return {
      id: record.id,
      disputeId: record.disputeId,
      recordedAt: record.recordedAt,
      recorderName: record.recorderName,
      content: record.content,
      isOnSiteInspection: record.isOnSiteInspection,
      createdAt: record.createdAt,
    };
  }

  async closeDispute(id: string, dto: CloseDisputeDto) {
    const dispute = await this.prisma.disputeCase.findUnique({ where: { id } });
    if (!dispute) throw new NotFoundException('纠纷记录不存在');
    if (dispute.status !== DisputeStatus.MEDIATING) {
      throw new BadRequestException('只有调解中状态的纠纷可以结案');
    }

    if (!Object.values(MediationResult).includes(dto.result as MediationResult)) {
      throw new BadRequestException(`无效的处理结论: ${dto.result}`);
    }

    const updated = await this.prisma.disputeCase.update({
      where: { id },
      data: {
        status: DisputeStatus.CLOSED,
        result: dto.result,
        resultNote: dto.resultNote,
        closedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      disputeNo: updated.disputeNo,
      status: updated.status,
      statusName: DisputeStatusNames[updated.status as DisputeStatus],
      result: updated.result,
      resultName: MediationResultNames[updated.result as MediationResult],
      resultNote: updated.resultNote,
      closedAt: updated.closedAt,
    };
  }

  async reopenDispute(id: string) {
    const dispute = await this.prisma.disputeCase.findUnique({ where: { id } });
    if (!dispute) throw new NotFoundException('纠纷记录不存在');
    if (dispute.status !== DisputeStatus.CLOSED) {
      throw new BadRequestException('只有已结案状态的纠纷可以重新打开');
    }

    if (dispute.closedAt) {
      const daysSinceClose = dayjs().diff(dayjs(dispute.closedAt), 'day');
      if (daysSinceClose >= AUTO_ARCHIVE_DAYS) {
        throw new BadRequestException(`结案已超过${AUTO_ARCHIVE_DAYS}天,无法重新打开`);
      }
    }

    const updated = await this.prisma.disputeCase.update({
      where: { id },
      data: {
        status: DisputeStatus.MEDIATING,
        result: null,
        resultNote: null,
        closedAt: null,
        updatedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      disputeNo: updated.disputeNo,
      status: updated.status,
      statusName: DisputeStatusNames[updated.status as DisputeStatus],
    };
  }

  async archiveDispute(id: string) {
    const dispute = await this.prisma.disputeCase.findUnique({ where: { id } });
    if (!dispute) throw new NotFoundException('纠纷记录不存在');
    if (dispute.status !== DisputeStatus.CLOSED) {
      throw new BadRequestException('只有已结案状态的纠纷可以归档');
    }

    const updated = await this.prisma.disputeCase.update({
      where: { id },
      data: {
        status: DisputeStatus.ARCHIVED,
        archivedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      disputeNo: updated.disputeNo,
      status: updated.status,
      statusName: DisputeStatusNames[updated.status as DisputeStatus],
      archivedAt: updated.archivedAt,
    };
  }

  private isOverdue(dispute: { status: string; acceptedAt: Date | null; expectedDays: number | null }): boolean {
    if (dispute.status !== DisputeStatus.MEDIATING) return false;
    if (!dispute.acceptedAt || !dispute.expectedDays) return false;
    const deadline = dayjs(dispute.acceptedAt).add(dispute.expectedDays, 'day');
    return dayjs().isAfter(deadline);
  }

  async queryDisputes(dto: QueryDisputesDto) {
    const page = dto.page || 1;
    const pageSize = dto.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (dto.startDate || dto.endDate) {
      where.occurredAt = {};
      if (dto.startDate) where.occurredAt.gte = dayjs(dto.startDate).startOf('day').toDate();
      if (dto.endDate) where.occurredAt.lte = dayjs(dto.endDate).endOf('day').toDate();
    }

    if (dto.type) where.type = dto.type;
    if (dto.status) where.status = dto.status;

    if (dto.isOverdue === true) {
      where.status = DisputeStatus.MEDIATING;
      where.acceptedAt = { not: null };
      where.expectedDays = { not: null };
    }

    const [disputes, total] = await Promise.all([
      this.prisma.disputeCase.findMany({
        where,
        include: {
          farmerLinks: { include: { farmer: { select: { id: true, code: true, name: true } } } },
          applicationLinks: { include: { application: { select: { id: true, status: true, targetDate: true } } } },
          mediationRecords: { orderBy: { recordedAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.disputeCase.count({ where }),
    ]);

    const items = disputes.map((d) => ({
      id: d.id,
      disputeNo: d.disputeNo,
      type: d.type,
      typeName: DisputeTypeNames[d.type as DisputeType],
      description: d.description,
      occurredAt: d.occurredAt,
      status: d.status,
      statusName: DisputeStatusNames[d.status as DisputeStatus],
      isOverdue: this.isOverdue(d),
      mediatorName: d.mediatorName,
      expectedDays: d.expectedDays,
      acceptedAt: d.acceptedAt,
      closedAt: d.closedAt,
      result: d.result,
      resultName: d.result ? MediationResultNames[d.result as MediationResult] : null,
      resultNote: d.resultNote,
      farmers: d.farmerLinks.map((fl) => fl.farmer),
      applications: d.applicationLinks.map((al) => al.application),
      mediationRecordCount: d.mediationRecords.length,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));

    return { total, page, pageSize, items };
  }

  async getDisputeDetail(id: string) {
    const dispute = await this.prisma.disputeCase.findUnique({
      where: { id },
      include: {
        farmerLinks: { include: { farmer: { select: { id: true, code: true, name: true, channelId: true } } } },
        applicationLinks: {
          include: {
            application: {
              select: {
                id: true,
                status: true,
                targetDate: true,
                requestVolume: true,
                expectedFlow: true,
                expectedHours: true,
                farmerId: true,
                createdAt: true,
              },
            },
          },
        },
        mediationRecords: { orderBy: { recordedAt: 'asc' } },
      },
    });

    if (!dispute) throw new NotFoundException('纠纷记录不存在');

    return {
      id: dispute.id,
      disputeNo: dispute.disputeNo,
      type: dispute.type,
      typeName: DisputeTypeNames[dispute.type as DisputeType],
      description: dispute.description,
      occurredAt: dispute.occurredAt,
      status: dispute.status,
      statusName: DisputeStatusNames[dispute.status as DisputeStatus],
      isOverdue: this.isOverdue(dispute),
      mediatorName: dispute.mediatorName,
      expectedDays: dispute.expectedDays,
      acceptedAt: dispute.acceptedAt,
      closedAt: dispute.closedAt,
      archivedAt: dispute.archivedAt,
      result: dispute.result,
      resultName: dispute.result ? MediationResultNames[dispute.result as MediationResult] : null,
      resultNote: dispute.resultNote,
      farmers: dispute.farmerLinks.map((fl) => fl.farmer),
      applications: dispute.applicationLinks.map((al) => al.application),
      mediationTimeline: dispute.mediationRecords.map((r) => ({
        id: r.id,
        recordedAt: r.recordedAt,
        recorderName: r.recorderName,
        content: r.content,
        isOnSiteInspection: r.isOnSiteInspection,
      })),
      createdAt: dispute.createdAt,
      updatedAt: dispute.updatedAt,
    };
  }

  async getFarmerDisputes(farmerId: string) {
    const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId } });
    if (!farmer) throw new NotFoundException('用水户不存在');

    const links = await this.prisma.disputeFarmerLink.findMany({
      where: { farmerId },
      include: {
        dispute: {
          include: {
            farmerLinks: { include: { farmer: { select: { id: true, code: true, name: true } } } },
            mediationRecords: { orderBy: { recordedAt: 'asc' } },
          },
        },
      },
      orderBy: { dispute: { createdAt: 'desc' } },
    });

    return {
      farmer: { id: farmer.id, code: farmer.code, name: farmer.name },
      total: links.length,
      disputes: links.map((link) => {
        const d = link.dispute;
        return {
          id: d.id,
          disputeNo: d.disputeNo,
          type: d.type,
          typeName: DisputeTypeNames[d.type as DisputeType],
          description: d.description,
          occurredAt: d.occurredAt,
          status: d.status,
          statusName: DisputeStatusNames[d.status as DisputeStatus],
          isOverdue: this.isOverdue(d),
          result: d.result,
          resultName: d.result ? MediationResultNames[d.result as MediationResult] : null,
          otherFarmers: d.farmerLinks
            .filter((fl) => fl.farmerId !== farmerId)
            .map((fl) => fl.farmer),
          mediationRecordCount: d.mediationRecords.length,
          createdAt: d.createdAt,
        };
      }),
    };
  }

  async getQuarterlyStats(dto: QuarterlyStatsDto) {
    const { year, quarter } = dto;
    const months = quarterToMonths(quarter);
    if (months.length === 0) {
      throw new BadRequestException('无效的季度,请使用Q1/Q2/Q3/Q4');
    }

    const quarterStart = dayjs(`${year}-${String(months[0]).padStart(2, '0')}-01`).startOf('day');
    const quarterEnd = quarterStart.add(3, 'month');

    const disputes = await this.prisma.disputeCase.findMany({
      where: {
        occurredAt: {
          gte: quarterStart.toDate(),
          lt: quarterEnd.toDate(),
        },
      },
      select: {
        type: true,
        status: true,
        acceptedAt: true,
        closedAt: true,
        expectedDays: true,
      },
    });

    const typeCountMap: Record<string, number> = {};
    const typeDaysMap: Record<string, number[]> = {};

    for (const d of disputes) {
      const t = d.type;
      typeCountMap[t] = (typeCountMap[t] || 0) + 1;
      if (d.acceptedAt && d.closedAt) {
        const processingDays = dayjs(d.closedAt).diff(dayjs(d.acceptedAt), 'day');
        if (!typeDaysMap[t]) typeDaysMap[t] = [];
        typeDaysMap[t].push(processingDays);
      }
    }

    const typeStats = Object.values(DisputeType).map((t) => {
      const count = typeCountMap[t] || 0;
      const daysList = typeDaysMap[t] || [];
      const avgDays = daysList.length > 0
        ? Math.round(daysList.reduce((a, b) => a + b, 0) / daysList.length * 10) / 10
        : null;
      return {
        type: t,
        typeName: DisputeTypeNames[t],
        count,
        avgProcessingDays: avgDays,
      };
    });

    const allDays = Object.values(typeDaysMap).flat();
    const totalAvgDays = allDays.length > 0
      ? Math.round(allDays.reduce((a, b) => a + b, 0) / allDays.length * 10) / 10
      : null;

    return {
      year,
      quarter,
      quarterName: `第${['一', '二', '三', '四'][months[0] / 3 - 1]}季度`,
      totalDisputes: disputes.length,
      totalAvgProcessingDays: totalAvgDays,
      typeStats,
    };
  }

  private async checkAndApplyCreditPenalty(farmerIds: string[]) {
    const now = dayjs();
    const currentMonth = now.month() + 1;
    const currentYear = now.year();
    const quarter = monthToQuarter(currentMonth);
    const months = quarterToMonths(quarter);
    const quarterStart = dayjs(`${currentYear}-${String(months[0]).padStart(2, '0')}-01`).startOf('day');
    const quarterEnd = quarterStart.add(3, 'month');

    for (const farmerId of farmerIds) {
      const disputeCount = await this.prisma.disputeFarmerLink.count({
        where: {
          farmerId,
          dispute: {
            occurredAt: {
              gte: quarterStart.toDate(),
              lt: quarterEnd.toDate(),
            },
          },
        },
      });

      if (disputeCount >= DISPUTE_CREDIT_THRESHOLD) {
        try {
          await this.creditRatingService.adjustCreditScore(farmerId, {
            adjustScore: DISPUTE_CREDIT_PENALTY_SCORE,
            reason: `${currentYear}年${quarter}季度涉及${disputeCount}条纠纷,信用分扣${Math.abs(DISPUTE_CREDIT_PENALTY_SCORE)}分`,
            operator: 'dispute-mediation-system',
          });
        } catch (e) {
          console.error(`[纠纷信用扣分] 用水户${farmerId}信用扣分失败:`, e.message);
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: 'dispute_auto_archive' })
  async handleAutoArchive() {
    const cutoff = dayjs().subtract(AUTO_ARCHIVE_DAYS, 'day').toDate();

    const closedDisputes = await this.prisma.disputeCase.findMany({
      where: {
        status: DisputeStatus.CLOSED,
        closedAt: { lte: cutoff },
      },
      select: { id: true, disputeNo: true },
    });

    if (closedDisputes.length === 0) return;

    const ids = closedDisputes.map((d) => d.id);
    await this.prisma.disputeCase.updateMany({
      where: { id: { in: ids } },
      data: {
        status: DisputeStatus.ARCHIVED,
        archivedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`[Cron] 纠纷自动归档: ${closedDisputes.length}条已结案超${AUTO_ARCHIVE_DAYS}天的纠纷已归档`);
  }
}
