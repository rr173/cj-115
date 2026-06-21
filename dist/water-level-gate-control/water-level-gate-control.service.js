"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaterLevelGateControlService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const schedule_1 = require("@nestjs/schedule");
const enums_1 = require("../common/enums");
const dayjs_1 = __importDefault(require("dayjs"));
const DEVIATION_THRESHOLD = 0.05;
const ADJUSTMENT_COEFFICIENT = 10;
const ADJUSTMENT_INTERVAL_MS = 3 * 60 * 1000;
const OFFLINE_THRESHOLD_MS = 10 * 60 * 1000;
const DRY_THRESHOLD_MS = 5 * 60 * 1000;
const OVERFLOW_GATE_OPENING = 30;
let WaterLevelGateControlService = class WaterLevelGateControlService {
    constructor(prisma) {
        this.prisma = prisma;
        this.dryTrackers = new Map();
    }
    async createMonitor(dto) {
        if (dto.normalLower >= dto.normalUpper) {
            throw new common_1.BadRequestException('正常水位下限必须小于上限');
        }
        const channel = await this.prisma.channel.findUnique({ where: { id: dto.channelId } });
        if (!channel)
            throw new common_1.BadRequestException('渠道不存在');
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
    async getChannelMonitors(channelId) {
        const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
        if (!channel)
            throw new common_1.NotFoundException('渠道不存在');
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
    async reportReadings(dto) {
        const savedReadings = [];
        const channelIds = new Set();
        for (const r of dto.readings) {
            const monitor = await this.prisma.waterLevelMonitor.findUnique({
                where: { id: r.monitorId },
                include: { channel: true },
            });
            if (!monitor) {
                throw new common_1.BadRequestException(`监测点 ${r.monitorId} 不存在`);
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
                data: { lastReadingAt: new Date(r.timestamp), status: enums_1.MonitorStatus.ONLINE },
            });
            savedReadings.push(reading);
            channelIds.add(monitor.channelId);
        }
        for (const channelId of channelIds) {
            await this.processChannelReadings(channelId);
        }
        return { count: savedReadings.length, readings: savedReadings };
    }
    async processChannelReadings(channelId) {
        const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
        if (!channel)
            return;
        const monitors = await this.prisma.waterLevelMonitor.findMany({
            where: { channelId, status: enums_1.MonitorStatus.ONLINE },
        });
        if (monitors.length === 0)
            return;
        const readings = new Map();
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
            if (!r)
                continue;
            const overflowThreshold = m.normalUpper + m.alertOverUpper;
            if (r.value > overflowThreshold) {
                await this.handleOverflow(channelId, m, r.value, overflowThreshold);
                return;
            }
        }
        const gate = await this.prisma.gate.findUnique({ where: { channelId } });
        if (!gate || gate.controlMode !== enums_1.GateControlMode.AUTO)
            return;
        const now = new Date();
        if (gate.manualOverrideUntil && gate.manualOverrideUntil.getTime() > now.getTime()) {
            return;
        }
        if (gate.manualOverrideUntil && gate.manualOverrideUntil.getTime() <= now.getTime()) {
            await this.prisma.gate.update({
                where: { id: gate.id },
                data: { manualOverrideUntil: null },
            });
            gate.manualOverrideUntil = null;
        }
        const activeAllocation = await this.prisma.waterAllocation.findFirst({
            where: {
                channelId,
                startTime: { lte: now },
                endTime: { gt: now },
            },
        });
        if (!activeAllocation)
            return;
        const avgNormalLower = monitors.reduce((s, m) => s + m.normalLower, 0) / monitors.length;
        const avgNormalUpper = monitors.reduce((s, m) => s + m.normalUpper, 0) / monitors.length;
        const planFlowRatio = activeAllocation.flow / channel.maxFlow;
        const targetLevel = avgNormalLower + planFlowRatio * (avgNormalUpper - avgNormalLower);
        const actualValues = monitors
            .map((m) => readings.get(m.id))
            .filter((r) => !!r)
            .map((r) => r.value);
        const avgLevel = actualValues.reduce((s, v) => s + v, 0) / actualValues.length;
        const deviation = avgLevel - targetLevel;
        if (Math.abs(deviation) <= DEVIATION_THRESHOLD)
            return;
        if (gate.lastAdjustedAt) {
            const elapsed = now.getTime() - gate.lastAdjustedAt.getTime();
            if (elapsed < ADJUSTMENT_INTERVAL_MS)
                return;
        }
        let adjustment = deviation * ADJUSTMENT_COEFFICIENT;
        let maxSingleAdjust = gate.currentOpening * 0.2;
        if (gate.currentOpening === 0 && deviation < 0) {
            maxSingleAdjust = Math.max(5, gate.maxOpening * 0.1);
        }
        adjustment = Math.max(-maxSingleAdjust, Math.min(maxSingleAdjust, adjustment));
        let targetOpening;
        if (deviation > 0) {
            targetOpening = Math.max(0, gate.currentOpening - adjustment);
        }
        else {
            targetOpening = Math.min(gate.maxOpening, gate.currentOpening - adjustment);
        }
        if (targetOpening === gate.currentOpening)
            return;
        await this.applyGateAdjustment(gate.id, gate.currentOpening, targetOpening, channelId, enums_1.GateAdjustmentReason.AUTO_PLAN);
    }
    async handleOverflow(channelId, monitor, value, threshold) {
        const gate = await this.prisma.gate.findUnique({ where: { channelId } });
        if (gate && gate.controlMode === enums_1.GateControlMode.AUTO) {
            await this.prisma.$transaction([
                this.prisma.gate.update({
                    where: { id: gate.id },
                    data: {
                        currentOpening: OVERFLOW_GATE_OPENING,
                        lastAdjustedAt: new Date(),
                        manualOverrideUntil: null,
                    },
                }),
                this.prisma.gateAdjustmentLog.create({
                    data: {
                        gateId: gate.id,
                        previousOpening: gate.currentOpening,
                        targetOpening: OVERFLOW_GATE_OPENING,
                        reason: enums_1.GateAdjustmentReason.AUTO_OVERFLOW,
                        channelId,
                    },
                }),
            ]);
        }
        const existingUnresolved = await this.prisma.waterLevelAlert.findFirst({
            where: {
                type: enums_1.WaterLevelAlertType.OVERFLOW,
                channelId,
                monitorId: monitor.id,
                isResolved: false,
            },
        });
        if (!existingUnresolved) {
            await this.prisma.waterLevelAlert.create({
                data: {
                    type: enums_1.WaterLevelAlertType.OVERFLOW,
                    channelId,
                    monitorId: monitor.id,
                    value,
                    threshold,
                    message: `渠道 ${monitor.channel?.code || channelId} 监测点 ${monitor.code} 水位 ${value.toFixed(2)}m 超过溢出阈值 ${threshold.toFixed(2)}m`,
                },
            });
        }
    }
    async applyGateAdjustment(gateId, previousOpening, targetOpening, channelId, reason) {
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
    async getMonitorHistory(monitorId, startTime, endTime) {
        const monitor = await this.prisma.waterLevelMonitor.findUnique({ where: { id: monitorId } });
        if (!monitor)
            throw new common_1.NotFoundException('监测点不存在');
        const where = { monitorId };
        if (startTime || endTime) {
            where.timestamp = {};
            if (startTime)
                where.timestamp.gte = new Date(startTime);
            if (endTime)
                where.timestamp.lte = new Date(endTime);
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
    async createGate(dto) {
        const channel = await this.prisma.channel.findUnique({ where: { id: dto.channelId } });
        if (!channel)
            throw new common_1.BadRequestException('渠道不存在');
        const existing = await this.prisma.gate.findUnique({ where: { channelId: dto.channelId } });
        if (existing)
            throw new common_1.BadRequestException('该渠道已有闸门');
        return this.prisma.gate.create({
            data: {
                code: dto.code,
                channelId: dto.channelId,
                maxOpening: dto.maxOpening,
                currentOpening: 0,
                controlMode: enums_1.GateControlMode.AUTO,
            },
            include: { channel: { select: { id: true, code: true, name: true } } },
        });
    }
    async getGateStatus(gateId) {
        const gate = await this.prisma.gate.findUnique({
            where: { id: gateId },
            include: { channel: { select: { id: true, code: true, name: true } } },
        });
        if (!gate)
            throw new common_1.NotFoundException('闸门不存在');
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
            manualOverrideUntil: gate.manualOverrideUntil,
            lastAdjustedAt: gate.lastAdjustedAt,
            recentAdjustments: recentLogs,
        };
    }
    async manualSetOpening(gateId, dto) {
        const gate = await this.prisma.gate.findUnique({ where: { id: gateId } });
        if (!gate)
            throw new common_1.NotFoundException('闸门不存在');
        if (dto.targetOpening < 0 || dto.targetOpening > gate.maxOpening) {
            throw new common_1.BadRequestException(`目标开度必须在 0 ~ ${gate.maxOpening}% 之间`);
        }
        const now = new Date();
        const currentAllocation = await this.prisma.waterAllocation.findFirst({
            where: {
                channelId: gate.channelId,
                startTime: { lte: now },
                endTime: { gt: now },
            },
            orderBy: { endTime: 'desc' },
        });
        let manualOverrideUntil;
        if (currentAllocation) {
            manualOverrideUntil = currentAllocation.endTime;
        }
        else {
            const nextAllocation = await this.prisma.waterAllocation.findFirst({
                where: {
                    channelId: gate.channelId,
                    startTime: { gt: now },
                },
                orderBy: { startTime: 'asc' },
            });
            manualOverrideUntil = nextAllocation ? nextAllocation.endTime : (0, dayjs_1.default)(now).add(1, 'hour').toDate();
        }
        const previousOpening = gate.currentOpening;
        await this.prisma.$transaction([
            this.prisma.gate.update({
                where: { id: gateId },
                data: {
                    currentOpening: dto.targetOpening,
                    lastAdjustedAt: now,
                    manualOverrideUntil,
                },
            }),
            this.prisma.gateAdjustmentLog.create({
                data: {
                    gateId,
                    previousOpening,
                    targetOpening: dto.targetOpening,
                    reason: enums_1.GateAdjustmentReason.MANUAL,
                    channelId: gate.channelId,
                },
            }),
        ]);
        return { gateId, previousOpening, targetOpening: dto.targetOpening, mode: 'MANUAL_OVERRIDE', manualOverrideUntil };
    }
    async switchGateMode(gateId, dto) {
        const gate = await this.prisma.gate.findUnique({ where: { id: gateId } });
        if (!gate)
            throw new common_1.NotFoundException('闸门不存在');
        const updateData = { controlMode: dto.controlMode };
        if (dto.controlMode === enums_1.GateControlMode.MANUAL || gate.manualOverrideUntil) {
            updateData.manualOverrideUntil = null;
        }
        await this.prisma.gate.update({
            where: { id: gateId },
            data: updateData,
        });
        return { gateId, controlMode: dto.controlMode };
    }
    async getAlerts(query) {
        const where = {};
        if (query.type)
            where.type = query.type;
        if (query.channelId)
            where.channelId = query.channelId;
        if (query.unresolvedOnly)
            where.isResolved = false;
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
    async checkOfflineMonitors() {
        const threshold = (0, dayjs_1.default)().subtract(10, 'minute').toDate();
        const offlineMonitors = await this.prisma.waterLevelMonitor.findMany({
            where: {
                status: enums_1.MonitorStatus.ONLINE,
                lastReadingAt: { lt: threshold },
            },
            include: { channel: { select: { id: true, code: true, name: true } } },
        });
        for (const m of offlineMonitors) {
            await this.prisma.waterLevelMonitor.update({
                where: { id: m.id },
                data: { status: enums_1.MonitorStatus.OFFLINE },
            });
            const existingAlert = await this.prisma.waterLevelAlert.findFirst({
                where: {
                    type: enums_1.WaterLevelAlertType.DEVICE_OFFLINE,
                    monitorId: m.id,
                    isResolved: false,
                },
            });
            if (!existingAlert) {
                await this.prisma.waterLevelAlert.create({
                    data: {
                        type: enums_1.WaterLevelAlertType.DEVICE_OFFLINE,
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
                status: enums_1.MonitorStatus.OFFLINE,
                lastReadingAt: { gte: threshold },
            },
        });
        for (const m of backOnlineMonitors) {
            await this.prisma.waterLevelMonitor.update({
                where: { id: m.id },
                data: { status: enums_1.MonitorStatus.ONLINE },
            });
            await this.prisma.waterLevelAlert.updateMany({
                where: {
                    type: enums_1.WaterLevelAlertType.DEVICE_OFFLINE,
                    monitorId: m.id,
                    isResolved: false,
                },
                data: { isResolved: true, resolvedAt: new Date() },
            });
        }
    }
    async checkAllMonitorsOffline(channelId) {
        const total = await this.prisma.waterLevelMonitor.count({
            where: { channelId },
        });
        const online = await this.prisma.waterLevelMonitor.count({
            where: { channelId, status: enums_1.MonitorStatus.ONLINE },
        });
        if (total > 0 && online === 0) {
            const gate = await this.prisma.gate.findUnique({ where: { channelId } });
            if (gate && gate.controlMode === enums_1.GateControlMode.AUTO) {
                await this.prisma.gate.update({
                    where: { id: gate.id },
                    data: { controlMode: enums_1.GateControlMode.MANUAL },
                });
            }
            const existingAlert = await this.prisma.waterLevelAlert.findFirst({
                where: {
                    type: enums_1.WaterLevelAlertType.ALL_OFFLINE,
                    channelId,
                    isResolved: false,
                },
            });
            if (!existingAlert) {
                await this.prisma.waterLevelAlert.create({
                    data: {
                        type: enums_1.WaterLevelAlertType.ALL_OFFLINE,
                        channelId,
                        message: `渠道所有监测点均离线，闸门已切换为手动模式`,
                    },
                });
            }
        }
    }
    async checkDryConditions() {
        const channels = await this.prisma.channel.findMany({
            include: { monitors: true },
        });
        for (const channel of channels) {
            const onlineMonitors = channel.monitors.filter((m) => m.status === enums_1.MonitorStatus.ONLINE);
            if (onlineMonitors.length === 0)
                continue;
            let anyDry = false;
            for (const m of onlineMonitors) {
                const latest = await this.prisma.waterLevelReading.findFirst({
                    where: { monitorId: m.id },
                    orderBy: { timestamp: 'desc' },
                });
                if (!latest)
                    continue;
                const dryThreshold = m.normalLower - m.alertBelowLower;
                if (latest.value < dryThreshold) {
                    anyDry = true;
                    const key = `${channel.id}_${m.id}`;
                    if (!this.dryTrackers.has(key)) {
                        this.dryTrackers.set(key, { since: new Date(), alerted: false });
                    }
                    const tracker = this.dryTrackers.get(key);
                    const elapsed = Date.now() - tracker.since.getTime();
                    if (elapsed >= DRY_THRESHOLD_MS && !tracker.alerted) {
                        await this.prisma.waterLevelAlert.create({
                            data: {
                                type: enums_1.WaterLevelAlertType.DRY,
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
                }
                else {
                    const key = `${channel.id}_${m.id}`;
                    if (this.dryTrackers.has(key)) {
                        this.dryTrackers.delete(key);
                    }
                }
            }
        }
    }
    async notifyUpstreamIncrease(channelId, value, threshold) {
        const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
        if (!channel || !channel.parentId)
            return;
        const parentGate = await this.prisma.gate.findUnique({
            where: { channelId: channel.parentId },
        });
        if (!parentGate || parentGate.controlMode !== enums_1.GateControlMode.AUTO)
            return;
        const increase = Math.min(parentGate.maxOpening * 0.1, (parentGate.maxOpening - parentGate.currentOpening) * 0.5);
        if (increase <= 0)
            return;
        const targetOpening = Math.min(parentGate.maxOpening, parentGate.currentOpening + increase);
        await this.applyGateAdjustment(parentGate.id, parentGate.currentOpening, targetOpening, channel.parentId, enums_1.GateAdjustmentReason.AUTO_DRY);
    }
};
exports.WaterLevelGateControlService = WaterLevelGateControlService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WaterLevelGateControlService.prototype, "checkOfflineMonitors", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WaterLevelGateControlService.prototype, "checkDryConditions", null);
exports.WaterLevelGateControlService = WaterLevelGateControlService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WaterLevelGateControlService);
//# sourceMappingURL=water-level-gate-control.service.js.map