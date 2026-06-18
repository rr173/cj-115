import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SetQuotaDto } from './dto';
import { ApplicationStatus } from '../common/enums';

@Injectable()
export class QuotaService {
  constructor(private prisma: PrismaService) {}

  async setQuota(dto: SetQuotaDto) {
    const farmer = await this.prisma.farmer.findUnique({ where: { id: dto.farmerId } });
    if (!farmer) throw new NotFoundException('用水户不存在');

    const existingQuota = await this.prisma.quota.findUnique({
      where: { farmerId_year_quarter: { farmerId: dto.farmerId, year: dto.year, quarter: dto.quarter } },
    });

    const newTotal = farmer.area * dto.amount;

    const cancelledApps: any[] = [];

    if (existingQuota && dto.amount < existingQuota.amount) {
      const oldTotal = farmer.area * existingQuota.amount;
      if (newTotal < oldTotal) {
        const pendingApps = await this.prisma.waterApplication.findMany({
          where: {
            farmerId: dto.farmerId,
            status: { in: [ApplicationStatus.PENDING, ApplicationStatus.SCHEDULED] },
          },
          orderBy: { submitTime: 'desc' },
        });

        const currentAppliedSum = pendingApps.reduce((sum, a) => sum + a.requestVolume, 0);

        if (currentAppliedSum > newTotal) {
          let exceeded = currentAppliedSum - newTotal;
          for (const app of pendingApps) {
            if (exceeded <= 0) break;
            await this.prisma.$transaction(async (tx) => {
              await tx.waterAllocation.deleteMany({ where: { applicationId: app.id } });
              await tx.waterApplication.update({
                where: { id: app.id },
                data: {
                  status: ApplicationStatus.CANCELLED_QUOTA,
                  failReason: '因定额调整取消',
                },
              });
            });
            cancelledApps.push({ id: app.id, requestVolume: app.requestVolume });
            exceeded -= app.requestVolume;
          }
        }
      }
    }

    const quota = await this.prisma.quota.upsert({
      where: { farmerId_year_quarter: { farmerId: dto.farmerId, year: dto.year, quarter: dto.quarter } },
      update: { amount: dto.amount },
      create: { ...dto },
    });

    return { quota, totalAvailable: newTotal, cancelledApplications: cancelledApps };
  }

  async findAll(year?: number, quarter?: string) {
    const where: any = {};
    if (year) where.year = year;
    if (quarter) where.quarter = quarter;
    return this.prisma.quota.findMany({
      where,
      include: { farmer: { select: { id: true, code: true, name: true, area: true } } },
      orderBy: [{ year: 'desc' }, { quarter: 'asc' }],
    });
  }

  async getFarmerQuotaStatus(farmerId: string, year: number, quarter: string) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { id: farmerId },
      include: {
        quotas: { where: { year, quarter: quarter as any } },
        applications: {
          where: {
            status: { in: [ApplicationStatus.PENDING, ApplicationStatus.SCHEDULED, ApplicationStatus.EXECUTED] },
          },
        },
      },
    });
    if (!farmer) throw new NotFoundException('用水户不存在');

    const quota = farmer.quotas[0];
    if (!quota) throw new BadRequestException('该季度定额尚未设置');

    const totalAvailable = farmer.area * quota.amount;
    const usedAmount = farmer.applications.reduce((sum, a) => sum + a.requestVolume, 0);
    const remaining = Math.max(0, totalAvailable - usedAmount);

    return {
      farmer: { id: farmer.id, code: farmer.code, name: farmer.name, area: farmer.area },
      quota: { amount: quota.amount, quarter, year },
      totalAvailable,
      appliedAmount: usedAmount,
      remainingAmount: remaining,
    };
  }

  async getFarmerAppliedAmount(farmerId: string, excludeAppId?: string) {
    const where: any = {
      farmerId,
      status: { in: [ApplicationStatus.PENDING, ApplicationStatus.SCHEDULED, ApplicationStatus.EXECUTED] },
    };
    if (excludeAppId) where.id = { not: excludeAppId };
    const apps = await this.prisma.waterApplication.findMany({ where });
    return apps.reduce((sum, a) => sum + a.requestVolume, 0);
  }

  async getFarmerQuota(farmerId: string, year: number, quarter: string) {
    const q = await this.prisma.quota.findUnique({
      where: { farmerId_year_quarter: { farmerId, year, quarter: quarter as any } },
    });
    return q;
  }
}
