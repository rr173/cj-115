import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditRatingService } from '../credit-rating/credit-rating.service';
import { EmergencyApprovalDto, ListEmergencyApplicationsDto, EmergencyStatisticsDto } from './dto';
import dayjs from 'dayjs';
import { EmergencyApprovalStatus, CreditHistoryType } from '../common/enums';

@Injectable()
export class EmergencyApplicationService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => CreditRatingService))
    private creditRatingService: CreditRatingService,
  ) {}

  async approve(id: string, dto: EmergencyApprovalDto) {
    const app = await this.prisma.waterApplication.findUnique({
      where: { id },
      include: { farmer: true },
    });

    if (!app) {
      throw new NotFoundException('申请不存在');
    }

    if (!app.isEmergency) {
      throw new BadRequestException('该申请不是紧急申请');
    }

    if (
      app.emergencyApprovalStatus === EmergencyApprovalStatus.APPROVED ||
      app.emergencyApprovalStatus === EmergencyApprovalStatus.REJECTED
    ) {
      throw new BadRequestException('该紧急申请已完成审批，不可重复操作');
    }

    if (dto.result === 'REJECTED' && !dto.rejectReason) {
      throw new BadRequestException('驳回紧急申请必须填写原因');
    }

    const updateData: any = {
      emergencyApprovalStatus:
        dto.result === 'APPROVED'
          ? EmergencyApprovalStatus.APPROVED
          : EmergencyApprovalStatus.REJECTED,
      emergencyApprovedAt: new Date(),
      emergencyApprovedBy: dto.operator || '系统管理员',
    };

    if (dto.result === 'REJECTED') {
      updateData.emergencyRejectReason = dto.rejectReason;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.waterApplication.update({
        where: { id },
        data: updateData,
      });

      if (dto.result === 'REJECTED') {
        await this.creditRatingService.adjustCreditScoreWithTx(
          tx,
          app.farmerId,
          -10,
          `紧急申请被驳回: ${dto.rejectReason}`,
          dto.operator || '系统管理员',
        );
      }
    });

    return {
      id: app.id,
      result: dto.result,
      farmerId: app.farmerId,
      farmerCode: app.farmer.code,
      farmerName: app.farmer.name,
      emergencyReason: app.emergencyReason,
      creditDeducted: dto.result === 'REJECTED' ? 10 : 0,
      approvedAt: updateData.emergencyApprovedAt,
      approvedBy: updateData.emergencyApprovedBy,
      rejectReason: dto.rejectReason,
    };
  }

  async findAll(dto: ListEmergencyApplicationsDto) {
    const page = dto.page || 1;
    const pageSize = dto.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {
      isEmergency: true,
    };

    if (dto.status) {
      where.emergencyApprovalStatus = dto.status;
    }

    if (dto.farmerId) {
      where.farmerId = dto.farmerId;
    }

    const [total, list] = await this.prisma.$transaction([
      this.prisma.waterApplication.count({ where }),
      this.prisma.waterApplication.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          farmer: { select: { id: true, code: true, name: true } },
          allocations: { include: { channel: { select: { id: true, code: true, name: true } } } },
        },
        orderBy: [{ createdAt: 'desc' }],
      }),
    ]);

    return {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      list: list.map((app) => ({
        id: app.id,
        farmerId: app.farmerId,
        farmerCode: app.farmer.code,
        farmerName: app.farmer.name,
        expectedFlow: app.expectedFlow,
        expectedHours: app.expectedHours,
        requestVolume: app.requestVolume,
        targetDate: dayjs(app.targetDate).format('YYYY-MM-DD'),
        status: app.status,
        emergencyReason: app.emergencyReason,
        emergencyApprovalStatus: app.emergencyApprovalStatus,
        emergencyApprovedAt: app.emergencyApprovedAt,
        emergencyApprovedBy: app.emergencyApprovedBy,
        emergencyRejectReason: app.emergencyRejectReason,
        emergencyTracedAt: app.emergencyTracedAt,
        submitTime: app.submitTime,
        allocations: app.allocations,
      })),
    };
  }

  async getMonthlyStatistics(dto: EmergencyStatisticsDto) {
    const { year, month } = dto;
    const monthStart = dayjs(`${year}-${month.toString().padStart(2, '0')}-01`).startOf('month');
    const monthEnd = monthStart.endOf('month');

    const emergencyApps = await this.prisma.waterApplication.findMany({
      where: {
        isEmergency: true,
        createdAt: {
          gte: monthStart.toDate(),
          lte: monthEnd.toDate(),
        },
      },
      include: { farmer: { select: { id: true, code: true, name: true } } },
      orderBy: [{ createdAt: 'asc' }],
    });

    const farmerStats = new Map<
      string,
      {
        farmerId: string;
        farmerCode: string;
        farmerName: string;
        totalCount: number;
        approvedCount: number;
        rejectedCount: number;
        pendingCount: number;
        tracedCount: number;
      }
    >();

    for (const app of emergencyApps) {
      if (!farmerStats.has(app.farmerId)) {
        farmerStats.set(app.farmerId, {
          farmerId: app.farmerId,
          farmerCode: app.farmer.code,
          farmerName: app.farmer.name,
          totalCount: 0,
          approvedCount: 0,
          rejectedCount: 0,
          pendingCount: 0,
          tracedCount: 0,
        });
      }
      const stats = farmerStats.get(app.farmerId)!;
      stats.totalCount++;

      switch (app.emergencyApprovalStatus) {
        case EmergencyApprovalStatus.APPROVED:
          stats.approvedCount++;
          break;
        case EmergencyApprovalStatus.REJECTED:
          stats.rejectedCount++;
          break;
        case EmergencyApprovalStatus.PENDING_APPROVAL:
          stats.pendingCount++;
          break;
        case EmergencyApprovalStatus.TO_BE_TRACED:
          stats.tracedCount++;
          break;
      }
    }

    const totalEmergency = emergencyApps.length;
    const totalApproved = emergencyApps.filter(
      (a) => a.emergencyApprovalStatus === EmergencyApprovalStatus.APPROVED,
    ).length;
    const totalRejected = emergencyApps.filter(
      (a) => a.emergencyApprovalStatus === EmergencyApprovalStatus.REJECTED,
    ).length;
    const totalPending = emergencyApps.filter(
      (a) => a.emergencyApprovalStatus === EmergencyApprovalStatus.PENDING_APPROVAL,
    ).length;
    const totalTraced = emergencyApps.filter(
      (a) => a.emergencyApprovalStatus === EmergencyApprovalStatus.TO_BE_TRACED,
    ).length;
    const totalReviewed = totalApproved + totalRejected;
    const approvalRate = totalReviewed > 0 ? +((totalApproved / totalReviewed) * 100).toFixed(2) : 0;

    return {
      year,
      month,
      summary: {
        totalEmergencyApplications: totalEmergency,
        totalApproved,
        totalRejected,
        totalPending,
        totalTraced,
        totalReviewed,
        overallApprovalRate: approvalRate,
      },
      farmerStatistics: Array.from(farmerStats.values()).map((s) => ({
        ...s,
        approvalRate:
          s.approvedCount + s.rejectedCount > 0
            ? +((s.approvedCount / (s.approvedCount + s.rejectedCount)) * 100).toFixed(2)
            : 0,
      })),
    };
  }

  async findOne(id: string) {
    const app = await this.prisma.waterApplication.findUnique({
      where: { id },
      include: {
        farmer: { select: { id: true, code: true, name: true, channel: { select: { id: true, code: true, name: true } } } },
        allocations: { include: { channel: { select: { id: true, code: true, name: true } } } },
      },
    });

    if (!app) {
      throw new NotFoundException('申请不存在');
    }

    if (!app.isEmergency) {
      throw new BadRequestException('该申请不是紧急申请');
    }

    return {
      id: app.id,
      farmerId: app.farmerId,
      farmerCode: app.farmer.code,
      farmerName: app.farmer.name,
      channel: app.farmer.channel,
      expectedFlow: app.expectedFlow,
      expectedHours: app.expectedHours,
      requestVolume: app.requestVolume,
      targetDate: dayjs(app.targetDate).format('YYYY-MM-DD'),
      originalTargetDate: dayjs(app.originalTargetDate).format('YYYY-MM-DD'),
      status: app.status,
      failReason: app.failReason,
      emergencyReason: app.emergencyReason,
      emergencyApprovalStatus: app.emergencyApprovalStatus,
      emergencyApprovedAt: app.emergencyApprovedAt,
      emergencyApprovedBy: app.emergencyApprovedBy,
      emergencyRejectReason: app.emergencyRejectReason,
      emergencyTracedAt: app.emergencyTracedAt,
      submitTime: app.submitTime,
      allocations: app.allocations,
      createdAt: app.createdAt,
    };
  }
}
