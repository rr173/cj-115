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
exports.RotationalIrrigationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const enums_1 = require("../common/enums");
const dayjs_1 = __importDefault(require("dayjs"));
let RotationalIrrigationService = class RotationalIrrigationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    computeRoundStatus(startDate, endDate) {
        const today = (0, dayjs_1.default)().startOf('day');
        const start = (0, dayjs_1.default)(startDate).startOf('day');
        const end = (0, dayjs_1.default)(endDate).startOf('day');
        if (today.isBefore(start))
            return enums_1.IrrigationRoundStatus.NOT_STARTED;
        if (today.isAfter(end))
            return enums_1.IrrigationRoundStatus.ENDED;
        return enums_1.IrrigationRoundStatus.IN_PROGRESS;
    }
    async getChannelAndDescendants(channelId) {
        const ids = [];
        const queue = [channelId];
        while (queue.length > 0) {
            const currentId = queue.shift();
            if (ids.includes(currentId))
                continue;
            ids.push(currentId);
            const children = await this.prisma.channel.findMany({
                where: { parentId: currentId },
                select: { id: true },
            });
            for (const child of children) {
                queue.push(child.id);
            }
        }
        return ids;
    }
    async expandChannelIds(channelIds) {
        const allIds = new Set();
        for (const cid of channelIds) {
            const descendants = await this.getChannelAndDescendants(cid);
            for (const id of descendants)
                allIds.add(id);
        }
        return Array.from(allIds);
    }
    async checkDateOverlapInSeason(seasonId, startDate, endDate, excludeRoundId) {
        const where = {
            seasonId,
            OR: [
                {
                    AND: [
                        { startDate: { lte: endDate } },
                        { endDate: { gte: startDate } },
                    ],
                },
            ],
        };
        if (excludeRoundId)
            where.id = { not: excludeRoundId };
        const overlapping = await this.prisma.irrigationRound.findFirst({ where });
        if (overlapping) {
            throw new common_1.BadRequestException(`轮次日期与同一灌溉季内的"${overlapping.name}"冲突 (${(0, dayjs_1.default)(overlapping.startDate).format('YYYY-MM-DD')} ~ ${(0, dayjs_1.default)(overlapping.endDate).format('YYYY-MM-DD')})`);
        }
    }
    async checkChannelUniqueInSeason(seasonId, channelIds, excludeRoundId) {
        const expandedIds = await this.expandChannelIds(channelIds);
        const where = { seasonId };
        if (excludeRoundId)
            where.id = { not: excludeRoundId };
        const existingRounds = await this.prisma.irrigationRound.findMany({
            where,
            include: { channels: { include: { channel: true } } },
        });
        for (const round of existingRounds) {
            for (const rc of round.channels) {
                if (expandedIds.includes(rc.channelId)) {
                    throw new common_1.BadRequestException(`渠道"${rc.channel.code}-${rc.channel.name}"已分配给轮次"${round.name}",同一条渠道只能出现在一个轮次中`);
                }
            }
        }
    }
    async createSeason(dto) {
        const start = (0, dayjs_1.default)(dto.startDate).startOf('day');
        const end = (0, dayjs_1.default)(dto.endDate).startOf('day');
        if (!start.isValid() || !end.isValid())
            throw new common_1.BadRequestException('日期格式错误');
        if (start.isAfter(end))
            throw new common_1.BadRequestException('开始日期不能晚于结束日期');
        return this.prisma.irrigationSeason.create({
            data: {
                name: dto.name,
                startDate: start.toDate(),
                endDate: end.toDate(),
            },
        });
    }
    async listSeasons() {
        return this.prisma.irrigationSeason.findMany({
            include: {
                rounds: {
                    include: {
                        channels: { include: { channel: { select: { id: true, code: true, name: true, level: true } } } },
                    },
                    orderBy: { startDate: 'asc' },
                },
            },
            orderBy: [{ startDate: 'desc' }],
        });
    }
    async getSeason(id) {
        const season = await this.prisma.irrigationSeason.findUnique({
            where: { id },
            include: {
                rounds: {
                    include: {
                        channels: { include: { channel: { select: { id: true, code: true, name: true, level: true } } } },
                    },
                    orderBy: { startDate: 'asc' },
                },
            },
        });
        if (!season)
            throw new common_1.NotFoundException('灌溉季不存在');
        return season;
    }
    async removeSeason(id) {
        const season = await this.prisma.irrigationSeason.findUnique({ where: { id } });
        if (!season)
            throw new common_1.NotFoundException('灌溉季不存在');
        return this.prisma.irrigationSeason.delete({ where: { id } });
    }
    async createRound(dto) {
        const season = await this.prisma.irrigationSeason.findUnique({ where: { id: dto.seasonId } });
        if (!season)
            throw new common_1.NotFoundException('灌溉季不存在');
        const start = (0, dayjs_1.default)(dto.startDate).startOf('day');
        const end = (0, dayjs_1.default)(dto.endDate).startOf('day');
        if (!start.isValid() || !end.isValid())
            throw new common_1.BadRequestException('日期格式错误');
        if (start.isAfter(end))
            throw new common_1.BadRequestException('开始日期不能晚于结束日期');
        if (start.isBefore((0, dayjs_1.default)(season.startDate).startOf('day')) || end.isAfter((0, dayjs_1.default)(season.endDate).startOf('day'))) {
            throw new common_1.BadRequestException(`轮次日期必须在灌溉季范围内 (${(0, dayjs_1.default)(season.startDate).format('YYYY-MM-DD')} ~ ${(0, dayjs_1.default)(season.endDate).format('YYYY-MM-DD')})`);
        }
        for (const cid of dto.channelIds) {
            const ch = await this.prisma.channel.findUnique({ where: { id: cid } });
            if (!ch)
                throw new common_1.BadRequestException(`渠道ID ${cid} 不存在`);
        }
        await this.checkDateOverlapInSeason(dto.seasonId, start.toDate(), end.toDate());
        await this.checkChannelUniqueInSeason(dto.seasonId, dto.channelIds);
        const expandedIds = await this.expandChannelIds(dto.channelIds);
        return this.prisma.irrigationRound.create({
            data: {
                seasonId: dto.seasonId,
                name: dto.name,
                startDate: start.toDate(),
                endDate: end.toDate(),
                waterLimit: dto.waterLimit,
                channels: {
                    create: expandedIds.map((cid) => ({ channelId: cid })),
                },
            },
            include: {
                channels: { include: { channel: { select: { id: true, code: true, name: true, level: true } } } },
            },
        });
    }
    async updateRound(id, dto) {
        const round = await this.prisma.irrigationRound.findUnique({ where: { id } });
        if (!round)
            throw new common_1.NotFoundException('轮次不存在');
        let start = (0, dayjs_1.default)(round.startDate).startOf('day');
        let end = (0, dayjs_1.default)(round.endDate).startOf('day');
        if (dto.startDate !== undefined)
            start = (0, dayjs_1.default)(dto.startDate).startOf('day');
        if (dto.endDate !== undefined)
            end = (0, dayjs_1.default)(dto.endDate).startOf('day');
        if (!start.isValid() || !end.isValid())
            throw new common_1.BadRequestException('日期格式错误');
        if (start.isAfter(end))
            throw new common_1.BadRequestException('开始日期不能晚于结束日期');
        const season = await this.prisma.irrigationSeason.findUnique({ where: { id: round.seasonId } });
        if (season && (start.isBefore((0, dayjs_1.default)(season.startDate).startOf('day')) || end.isAfter((0, dayjs_1.default)(season.endDate).startOf('day')))) {
            throw new common_1.BadRequestException(`轮次日期必须在灌溉季范围内 (${(0, dayjs_1.default)(season.startDate).format('YYYY-MM-DD')} ~ ${(0, dayjs_1.default)(season.endDate).format('YYYY-MM-DD')})`);
        }
        await this.checkDateOverlapInSeason(round.seasonId, start.toDate(), end.toDate(), id);
        if (dto.channelIds) {
            for (const cid of dto.channelIds) {
                const ch = await this.prisma.channel.findUnique({ where: { id: cid } });
                if (!ch)
                    throw new common_1.BadRequestException(`渠道ID ${cid} 不存在`);
            }
            await this.checkChannelUniqueInSeason(round.seasonId, dto.channelIds, id);
        }
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.startDate !== undefined)
            data.startDate = start.toDate();
        if (dto.endDate !== undefined)
            data.endDate = end.toDate();
        if (dto.waterLimit !== undefined)
            data.waterLimit = dto.waterLimit;
        if (dto.channelIds) {
            const expandedIds = await this.expandChannelIds(dto.channelIds);
            return this.prisma.$transaction(async (tx) => {
                await tx.irrigationRoundChannel.deleteMany({ where: { roundId: id } });
                await tx.irrigationRoundChannel.createMany({
                    data: expandedIds.map((cid) => ({ roundId: id, channelId: cid })),
                });
                return tx.irrigationRound.update({
                    where: { id },
                    data,
                    include: {
                        channels: { include: { channel: { select: { id: true, code: true, name: true, level: true } } } },
                    },
                });
            });
        }
        return this.prisma.irrigationRound.update({
            where: { id },
            data,
            include: {
                channels: { include: { channel: { select: { id: true, code: true, name: true, level: true } } } },
            },
        });
    }
    async getRound(id) {
        const round = await this.prisma.irrigationRound.findUnique({
            where: { id },
            include: {
                season: true,
                channels: { include: { channel: { select: { id: true, code: true, name: true, level: true } } } },
            },
        });
        if (!round)
            throw new common_1.NotFoundException('轮次不存在');
        return round;
    }
    async listRounds(seasonId, status) {
        const where = {};
        if (seasonId)
            where.seasonId = seasonId;
        let rounds = await this.prisma.irrigationRound.findMany({
            where,
            include: {
                season: true,
                channels: { include: { channel: { select: { id: true, code: true, name: true, level: true } } } },
            },
            orderBy: { startDate: 'asc' },
        });
        if (status) {
            rounds = rounds.filter((r) => this.computeRoundStatus(r.startDate, r.endDate) === status);
        }
        return rounds;
    }
    async removeRound(id) {
        const round = await this.prisma.irrigationRound.findUnique({ where: { id } });
        if (!round)
            throw new common_1.NotFoundException('轮次不存在');
        return this.prisma.irrigationRound.delete({ where: { id } });
    }
    async findActiveRoundForChannel(channelId) {
        const today = (0, dayjs_1.default)().startOf('day').toDate();
        const tomorrow = (0, dayjs_1.default)().add(1, 'day').startOf('day').toDate();
        const roundChannels = await this.prisma.irrigationRoundChannel.findMany({
            where: { channelId },
            include: {
                round: {
                    include: { season: true },
                },
            },
        });
        for (const rc of roundChannels) {
            const status = this.computeRoundStatus(rc.round.startDate, rc.round.endDate);
            if (status === enums_1.IrrigationRoundStatus.IN_PROGRESS) {
                return rc.round;
            }
        }
        return null;
    }
    async findNextRoundForChannel(channelId) {
        const today = (0, dayjs_1.default)().startOf('day').toDate();
        const roundChannels = await this.prisma.irrigationRoundChannel.findMany({
            where: { channelId },
            include: {
                round: {
                    include: { season: true },
                },
            },
        });
        const futureRounds = roundChannels
            .filter((rc) => (0, dayjs_1.default)(rc.round.startDate).startOf('day').isAfter((0, dayjs_1.default)(today)))
            .sort((a, b) => a.round.startDate.getTime() - b.round.startDate.getTime());
        return futureRounds.length > 0 ? futureRounds[0].round : null;
    }
    async getRoundWaterUsage(roundId) {
        const round = await this.prisma.irrigationRound.findUnique({ where: { id: roundId } });
        if (!round)
            throw new common_1.NotFoundException('轮次不存在');
        const apps = await this.prisma.waterApplication.findMany({
            where: {
                roundId,
                status: { in: ['SCHEDULED', 'EXECUTED'] },
            },
            include: { actualUsage: true },
        });
        const plannedVolume = apps.reduce((sum, a) => sum + a.requestVolume, 0);
        const actualVolume = apps.reduce((sum, a) => sum + (a.actualUsage?.actualVolume || 0), 0);
        const remaining = Math.max(0, round.waterLimit - plannedVolume);
        const usagePercent = round.waterLimit > 0 ? (plannedVolume / round.waterLimit) * 100 : 0;
        let warningLevel = 'NORMAL';
        if (usagePercent >= 100)
            warningLevel = 'CRITICAL';
        else if (usagePercent >= 90)
            warningLevel = 'WARNING';
        return {
            roundId: round.id,
            roundName: round.name,
            waterLimit: round.waterLimit,
            plannedVolume,
            actualVolume,
            remaining,
            usagePercent: +usagePercent.toFixed(2),
            warningLevel,
            applicationCount: apps.length,
        };
    }
    async getRoundSummary(roundId) {
        const round = await this.prisma.irrigationRound.findUnique({
            where: { id: roundId },
            include: {
                channels: {
                    include: {
                        channel: {
                            select: { id: true, code: true, name: true, level: true },
                        },
                    },
                },
            },
        });
        if (!round)
            throw new common_1.NotFoundException('轮次不存在');
        const channelIds = round.channels.map((rc) => rc.channelId);
        const allocations = await this.prisma.waterAllocation.findMany({
            where: {
                channelId: { in: channelIds },
                application: { roundId },
            },
            include: {
                application: { include: { farmer: true, actualUsage: true } },
            },
        });
        const byChannel = new Map();
        const seenApplicationIds = new Set();
        let totalPlannedVolume = 0;
        let totalActualVolume = 0;
        for (const alloc of allocations) {
            const durationHours = (new Date(alloc.endTime).getTime() - new Date(alloc.startTime).getTime()) / 3600000;
            const planned = alloc.flow * durationHours * 3600;
            const actual = alloc.application.actualUsage
                ? alloc.application.actualUsage.actualVolume * (planned / alloc.application.requestVolume)
                : 0;
            if (!byChannel.has(alloc.channelId)) {
                byChannel.set(alloc.channelId, { planned: 0, actual: 0, appCount: 0 });
            }
            const stat = byChannel.get(alloc.channelId);
            stat.planned += planned;
            stat.actual += actual;
            stat.appCount += 1;
            if (!seenApplicationIds.has(alloc.applicationId)) {
                seenApplicationIds.add(alloc.applicationId);
                totalPlannedVolume += alloc.application.requestVolume;
                totalActualVolume += alloc.application.actualUsage?.actualVolume || 0;
            }
        }
        const channelStats = round.channels.map((rc) => {
            const stat = byChannel.get(rc.channelId) || { planned: 0, actual: 0, appCount: 0 };
            const efficiency = stat.planned > 0 ? stat.actual / stat.planned : 0;
            return {
                channel: rc.channel,
                plannedVolume: +stat.planned.toFixed(2),
                actualVolume: +stat.actual.toFixed(2),
                efficiency: +efficiency.toFixed(4),
                applicationCount: stat.appCount,
            };
        });
        const totalPlanned = +totalPlannedVolume.toFixed(2);
        const totalActual = +totalActualVolume.toFixed(2);
        const isOverLimit = totalPlanned > round.waterLimit;
        return {
            round: {
                id: round.id,
                name: round.name,
                startDate: round.startDate,
                endDate: round.endDate,
                waterLimit: round.waterLimit,
                status: this.computeRoundStatus(round.startDate, round.endDate),
            },
            totalPlannedVolume: +totalPlanned.toFixed(2),
            totalActualVolume: +totalActual.toFixed(2),
            overallEfficiency: totalPlanned > 0 ? +(totalActual / totalPlanned).toFixed(4) : 0,
            isOverLimit,
            overLimitAmount: isOverLimit ? +(totalPlanned - round.waterLimit).toFixed(2) : 0,
            channelStats,
        };
    }
    async validateApplication(farmerId, targetDateStr, expectedHours, requestVolume) {
        const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId }, include: { channel: true } });
        if (!farmer)
            throw new common_1.NotFoundException('用水户不存在');
        const warnings = [];
        const activeRound = await this.findActiveRoundForChannel(farmer.channelId);
        if (!activeRound) {
            const nextRound = await this.findNextRoundForChannel(farmer.channelId);
            if (nextRound) {
                throw new common_1.BadRequestException(`当前不在您所在渠道(${farmer.channel.code})的灌溉轮次内,下一轮次为"${nextRound.name}",将于 ${(0, dayjs_1.default)(nextRound.startDate).format('YYYY-MM-DD')} 开始`);
            }
            else {
                throw new common_1.BadRequestException(`当前没有为您所在渠道(${farmer.channel.code})安排灌溉轮次,请联系管理员`);
            }
        }
        const targetDate = (0, dayjs_1.default)(targetDateStr).startOf('day');
        const roundEnd = (0, dayjs_1.default)(activeRound.endDate).startOf('day');
        const remainingDays = roundEnd.diff(targetDate, 'day') + 1;
        if (remainingDays < Math.ceil(expectedHours / 24)) {
            warnings.push(`轮次"${activeRound.name}"将于 ${(0, dayjs_1.default)(activeRound.endDate).format('YYYY-MM-DD')} 结束,剩余${remainingDays}天,您申请的${expectedHours}小时灌溉时长可能无法在本轮内完成`);
        }
        const usage = await this.getRoundWaterUsage(activeRound.id);
        if (usage.warningLevel === 'CRITICAL') {
            throw new common_1.BadRequestException(`轮次"${activeRound.name}"已达到供水量上限(${usage.waterLimit.toFixed(0)}m³),无法继续提交申请`);
        }
        if (usage.warningLevel === 'WARNING') {
            warnings.push(`轮次"${activeRound.name}"已使用水量的${usage.usagePercent}%,接近供水量上限(${usage.waterLimit.toFixed(0)}m³)`);
        }
        return {
            roundId: activeRound.id,
            roundName: activeRound.name,
            warnings,
        };
    }
};
exports.RotationalIrrigationService = RotationalIrrigationService;
exports.RotationalIrrigationService = RotationalIrrigationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RotationalIrrigationService);
//# sourceMappingURL=rotational-irrigation.service.js.map