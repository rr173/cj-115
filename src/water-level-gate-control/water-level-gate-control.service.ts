import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateMonitorDto, CreateGateDto, ReportReadingsDto, ManualGateOpeningDto, SwitchGateModeDto, QueryAlertsDto } from './dto';
import { GateControlMode, MonitorStatus, WaterLevelAlertType, GateAdjustmentReason } from '../common/enums';
import dayjs from 'dayjs';

const DEVIATION_THRESHOLD = 0.05;
const ADJUSTMENT_COEFFICIENT = 10;
const ADJUSTMENT_INTERVAL_MS = 3 * 60 * 1000;
const OFFLINE_THRESHOLD_MS = 10 * 60 * 1000;
const DRY_THRESHOLD_MS = 5 * 60 * 1000;
const OVERFLOW_GATE_OPENING = 30;

@Injectable()
export class WaterLevelGateControlService {
  private dryTrackers = new Map<string, { since: Date; alerted: boolean }>();

  constructor(private prisma: PrismaService) {}

  async createMonitor(dto: CreateMonitorDto) {
    if (dto.normalLower >= dto.normalUpper) {
      throw new BadRequestException('正常水位下限必须小于上限');
    }
    const channel = await this.prisma.channel.findUnique({ where: { id: dto.channelId } });
    if (!channel) throw new BadRequestException('渠道不存在');

    return this.prisma.waterLevelMonitor.create({
      data: {
        code: dto.code,
        channelId: dto.channelId,
        installPosition: dto.installPosition,
        normalLower: dto.normalLower,
        normalUpper: dto.normalUpper,
        alertOverUpper: dto.alertOverUpper,
        alertBelowLower: dto.alertBelowLower,
      },
      include: { channel: { select: { id: true, code: true, name: true } } },
    });
  }

  async getChannelMonitors(channelId: string) {
    const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) throw new NotFoundException('渠道不存在');

    const monitors = await this.prisma.waterLevelMonitor.findMany({
      where: { channelId },
      orderBy: { installPosition: 'asc' },
    });

    const result = [];
    for (const m of monitors) {
      const latestReading = await this.prisma.waterLevelReading.findFirst({
        where: { monitorId: m.id },
        orderBy: { timestamp: 'desc' },
      });
      result.push({
        id: m.id,
        code: m.code,
        installPosition: m.installPosition,
        normalLower: m.normalLower,
        normalUpper: m.normalUpper,
        alertOverUpper: m.alertOverUpper,
        alertBelowLower: m.alertBelowLower,
        status: m.status,
        lastReadingAt: m.lastReadingAt,
        latestReading: latestReading ? { value: latestReading.value, timestamp: latestReading.timestamp } : null,
      });
    }
    return result;
  }

  async reportReadings(dto: ReportReadingsDto) {
    const savedReadings = [];
    const channelIds = new Set<string>();

    for (const r of dto.readings) {
      const monitor = await this.prisma.waterLevelMonitor.findUnique({
        where: { id: r.monitorId },
        include: { channel: true },
      });
      if (!monitor) {
        throw new BadRequestException(`监测点 ${r.monitorId} 不存在`);
      }

      const reading = await this.prisma.waterLevelReading.create({
        data: {
          monitorId: r.monitorId,
          value: r.value,
          timestamp: new Date(r.timestamp),
        },
      });

      await this.prisma.waterLevelMonitor.update({
        where: { id: r.monitorId },
        data: { lastReadingAt: new Date(r.timestamp), status: MonitorStatus.ONLINE },
      });

      savedReadings.push(reading);
      channelIds.add(monitor.channelId);
    }

    for (const channelId of channelIds) {
      await this.processChannelReadings(channelId);
    }

    return { count: savedReadings.length, readings: savedReadings };
  }

  private async processChannelReadings(channelId: string) {
    const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) return;

    const monitors = await this.prisma.waterLevelMonitor.findMany({
      where: { channelId, status: MonitorStatus.ONLINE },
    });

    if (monitors.length === 0) return;

    const readings = new Map<string, { value: number; timestamp: Date }>();
    for (const m of monitors) {
      const latest = await this.prisma.waterLevelReading.findFirst({
        where: { monitorId: m.id },
        orderBy: { timestamp: 'desc' },
      });
      if (latest) {
        readings.set(m.id, { value: latest.value, timestamp: latest.timestamp });
      }
    }

    for (const m of monitors) {
      const r = readings.get(m.id);
      if (!r) continue;

      const overflowThreshold = m.normalUpper + m.alertOverUpper;
      if (r.value > overflowThreshold) {
        await this.handleOverflow(channelId, m, r.value, overflowThreshold);
        return;
      }
    }

    const gate = await this.prisma.gate.findUnique({ where: { channelId } });
    if (!gate || gate.controlMode !== GateControlMode.AUTO) return;

    const now = new Date();
    const activeAllocation = await this.prisma.waterAllocation.findFirst({
      where: {
        channelId,
        startTime: { lte: now },
        endTime: { gt: now },
      },
    });

    if (!activeAllocation) return;

    const avgNormalLower = monitors.reduce((s, m) => s + m.normalLower, 0) / monitors.length;
    const avgNormalUpper = monitors.reduce((s, m) => s + m.normalUpper, 0) / monitors.length;
    const planFlowRatio = activeAllocation.flow / channel.maxFlow;
    const targetLevel = avgNormalLower + planFlowRatio * (avgNormalUpper - avgNormalLower);

    const actualValues = monitors
      .map((m) => readings.get(m.id))
      .filter((r): r is { value: number; timestamp: Date } => !!r)
      .map((r) => r.value);
    const avgLevel = actualValues.reduce((s, v) => s + v, 0) / actualValues.length;
    const deviation = avgLevel - targetLevel;

    if (Math.abs(deviation) <= DEVIATION_THRESHOLD) return;

    if (gate.lastAdjustedAt) {
      const elapsed = now.getTime() - gate.lastAdjustedAt.getTime();
      if (elapsed < ADJUSTMENT_INTERVAL_MS) return;
    }

    let adjustment = deviation * ADJUSTMENT_COEFFICIENT;
    const maxSingleAdjust = gate.currentOpening * 0.2;
    adjustment = Math.max(-maxSingleAdjust, Math.min(maxSingleAdjust, adjustment));

    let targetOpening: number;
    if (deviation > 0) {
      targetOpening = Math.max(0, gate.currentOpening - adjustment);
    } else {
      targetOpening = Math.min(gate.maxOpening, gate.currentOpening - adjustment);
    }

    await this.applyGateAdjustment(gate.id, gate.currentOpening, targetOpening, channelId, GateAdjustmentReason.AUTO_PLAN);
  }

  private async handleOverflow(channelId: string, monitor: any, value: number, threshold: number) {
    const gate = await this.prisma.gate.findUnique({ where: { channelId } });
    if (gate && gate.controlMode === GateControlMode.AUTO) {
      await this.applyGateAdjustment(gate.id, gate.currentOpening, OVERFLOW_GATE_OPENING, channelId, GateAdjustmentReason.AUTO_OVERFLOW);
    }

    const existingUnresolved = await this.prisma.waterLevelAlert.findFirst({
      where: {
        type: WaterLevelAlertType.OVERFLOW,
        channelId,
        monitorId: monitor.id,
        isResolved: false,
      },
    });

    if (!existingUnresolved) {
      await this.prisma.waterLevelAlert.create({
        data: {
          type: WaterLevelAlertType.OVERFLOW,
          channelId,
          monitorId: monitor.id,
          value,
          threshold,
          message: `渠道 ${monitor.channel?.code || channelId} 监测点 ${monitor.code} 水位 ${value.toFixed(2)}m 超过溢出阈值 ${threshold.toFixed(2)}m`,
        },
      });
    }
  }

  private async applyGateAdjustment(gateId: string, previousOpening: number, targetOpening: number, channelId: string, reason: string) {
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.gate.update({
        where: { id: gateId },
        data: { currentOpening: targetOpening, lastAdjustedAt: now },
      }),
      this.prisma.gateAdjustmentLog.create({
        data: { gateId, previousOpening, targetOpening, reason, channelId },
      }),
    ]);
  }

  async getMonitorHistory(monitorId: string, startTime?: string, endTime?: string) {
    const monitor = await this.prisma.waterLevelMonitor.findUnique({ where: { id: monitorId } });
    if (!monitor) throw new NotFoundException('监测点不存在');

    const where: any = { monitorId };
    if (startTime || endTime) {
      where.timestamp = {};
      if (startTime) where.timestamp.gte = new Date(startTime);
      if (endTime) where.timestamp.lte = new Date(endTime);
    }

    const readings = await this.prisma.waterLevelReading.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 500,
    });

    return {
      monitor: { id: monitor.id, code: monitor.code, channelId: monitor.channelId },
      readings,
    };
  }

  async createGate(dto: CreateGateDto) {
    const channel = await this.prisma.channel.findUnique({ where: { id: dto.channelId } });
    if (!channel) throw new BadRequestException('渠道不存在');

    const existing = await this.prisma.gate.findUnique({ where: { channelId: dto.channelId } });
    if (existing) throw new BadRequestException('该渠道已有闸门');

    return this.prisma.gate.create({
      data: {
        code: dto.code,
        channelId: dto.channelId,
        maxOpening: dto.maxOpening,
        currentOpening: 0,
        controlMode: GateControlMode.AUTO,
      },
      include: { channel: { select: { id: true, code: true, name: true } } },
    });
  }

  async getGateStatus(gateId: string) {
    const gate = await this.prisma.gate.findUnique({
      where: { id: gateId },
      include: { channel: { select: { id: true, code: true, name: true } } },
    });
    if (!gate) throw new NotFoundException('闸门不存在');

    const recentLogs = await this.prisma.gateAdjustmentLog.findMany({
      where: { gateId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return {
      id: gate.id,
      code: gate.code,
      channel: gate.channel,
      maxOpening: gate.maxOpening,
      currentOpening: gate.currentOpening,
      controlMode: gate.controlMode,
      lastAdjustedAt: gate.lastAdjustedAt,
      recentAdjustments: recentLogs,
    };
  }

  async manualSetOpening(gateId: string, dto: ManualGateOpeningDto) {
    const gate = await this.prisma.gate.findUnique({ where: { id: gateId } });
    if (!gate) throw new NotFoundException('闸门不存在');

    if (dto.targetOpening < 0 || dto.targetOpening > gate.maxOpening) {
      throw new BadRequestException(`目标开度必须在 0 ~ ${gate.maxOpening}% 之间`);
    }

    const previousOpening = gate.currentOpening;
    await this.applyGateAdjustment(gateId, previousOpening, dto.targetOpening, gate.channelId, GateAdjustmentReason.MANUAL);

    return { gateId, previousOpening, targetOpening: dto.targetOpening, mode: 'MANUAL_OVERRIDE' };
  }

  async switchGateMode(gateId: string, dto: SwitchGateModeDto) {
    const gate = await this.prisma.gate.findUnique({ where: { id: gateId } });
    if (!gate) throw new NotFoundException('闸门不存在');

    await this.prisma.gate.update({
      where: { id: gateId },
      data: { controlMode: dto.controlMode },
    });

    return { gateId, controlMode: dto.controlMode };
  }

  async getAlerts(query: QueryAlertsDto) {
    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.channelId) where.channelId = query.channelId;
    if (query.unresolvedOnly) where.isResolved = false;

    const alerts = await this.prisma.waterLevelAlert.findMany({
      where,
      include: {
        channel: { select: { id: true, code: true, name: true } },
        monitor: { select: { id: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return alerts;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkOfflineMonitors() {
    const threshold = dayjs().subtract(10, 'minute').toDate();

    const offlineMonitors = await this.prisma.waterLevelMonitor.findMany({
      where: {
        status: MonitorStatus.ONLINE,
        lastReadingAt: { lt: threshold },
      },
      include: { channel: { select: { id: true, code: true, name: true } } },
    });

    for (const m of offlineMonitors) {
      await this.prisma.waterLevelMonitor.update({
        where: { id: m.id },
        data: { status: MonitorStatus.OFFLINE },
      });

      const existingAlert = await this.prisma.waterLevelAlert.findFirst({
        where: {
          type: WaterLevelAlertType.DEVICE_OFFLINE,
          monitorId: m.id,
          isResolved: false,
        },
      });

      if (!existingAlert) {
        await this.prisma.waterLevelAlert.create({
          data: {
            type: WaterLevelAlertType.DEVICE_OFFLINE,
            channelId: m.channelId,
            monitorId: m.id,
            message: `监测点 ${m.code} 超过10分钟未上报数据，标记为离线`,
          },
        });
      }

      await this.checkAllMonitorsOffline(m.channelId);
    }

    const backOnlineMonitors = await this.prisma.waterLevelMonitor.findMany({
      where: {
        status: MonitorStatus.OFFLINE,
        lastReadingAt: { gte: threshold },
      },
    });

    for (const m of backOnlineMonitors) {
      await this.prisma.waterLevelMonitor.update({
        where: { id: m.id },
        data: { status: MonitorStatus.ONLINE },
      });

      await this.prisma.waterLevelAlert.updateMany({
        where: {
          type: WaterLevelAlertType.DEVICE_OFFLINE,
          monitorId: m.id,
          isResolved: false,
        },
        data: { isResolved: true, resolvedAt: new Date() },
      });
    }
  }

  private async checkAllMonitorsOffline(channelId: string) {
    const total = await this.prisma.waterLevelMonitor.count({
      where: { channelId },
    });
    const online = await this.prisma.waterLevelMonitor.count({
      where: { channelId, status: MonitorStatus.ONLINE },
    });

    if (total > 0 && online === 0) {
      const gate = await this.prisma.gate.findUnique({ where: { channelId } });
      if (gate && gate.controlMode === GateControlMode.AUTO) {
        await this.prisma.gate.update({
          where: { id: gate.id },
          data: { controlMode: GateControlMode.MANUAL },
        });
      }

      const existingAlert = await this.prisma.waterLevelAlert.findFirst({
        where: {
          type: WaterLevelAlertType.ALL_OFFLINE,
          channelId,
          isResolved: false,
        },
      });

      if (!existingAlert) {
        await this.prisma.waterLevelAlert.create({
          data: {
            type: WaterLevelAlertType.ALL_OFFLINE,
            channelId,
            message: `渠道所有监测点均离线，闸门已切换为手动模式`,
          },
        });
      }
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkDryConditions() {
    const channels = await this.prisma.channel.findMany({
      include: { monitors: true },
    });

    for (const channel of channels) {
      const onlineMonitors = channel.monitors.filter((m) => m.status === MonitorStatus.ONLINE);
      if (onlineMonitors.length === 0) continue;

      let anyDry = false;
      for (const m of onlineMonitors) {
        const latest = await this.prisma.waterLevelReading.findFirst({
          where: { monitorId: m.id },
          orderBy: { timestamp: 'desc' },
        });
        if (!latest) continue;

        const dryThreshold = m.normalLower - m.alertBelowLower;
        if (latest.value < dryThreshold) {
          anyDry = true;
          const key = `${channel.id}_${m.id}`;
          if (!this.dryTrackers.has(key)) {
            this.dryTrackers.set(key, { since: new Date(), alerted: false });
          }
          const tracker = this.dryTrackers.get(key)!;
          const elapsed = Date.now() - tracker.since.getTime();

          if (elapsed >= DRY_THRESHOLD_MS && !tracker.alerted) {
            await this.prisma.waterLevelAlert.create({
              data: {
                type: WaterLevelAlertType.DRY,
                channelId: channel.id,
                monitorId: m.id,
                value: latest.value,
                threshold: dryThreshold,
                message: `渠道 ${channel.code} 监测点 ${m.code} 水位 ${latest.value.toFixed(2)}m 低于断流阈值 ${dryThreshold.toFixed(2)}m 已超过5分钟`,
              },
            });
            tracker.alerted = true;

            await this.notifyUpstreamIncrease(channel.id, latest.value, dryThreshold);
          }
        } else {
          const key = `${channel.id}_${m.id}`;
          if (this.dryTrackers.has(key)) {
            this.dryTrackers.delete(key);
          }
        }
      }
    }
  }

  private async notifyUpstreamIncrease(channelId: string, value: number, threshold: number) {
    const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel || !channel.parentId) return;

    const parentGate = await this.prisma.gate.findUnique({
      where: { channelId: channel.parentId },
    });

    if (!parentGate || parentGate.controlMode !== GateControlMode.AUTO) return;

    const increase = Math.min(parentGate.maxOpening * 0.1, (parentGate.maxOpening - parentGate.currentOpening) * 0.5);
    if (increase <= 0) return;

    const targetOpening = Math.min(parentGate.maxOpening, parentGate.currentOpening + increase);
    await this.applyGateAdjustment(parentGate.id, parentGate.currentOpening, targetOpening, channel.parentId, GateAdjustmentReason.AUTO_DRY);
  }
}
