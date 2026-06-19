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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotationalIrrigationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rotational_irrigation_service_1 = require("./rotational-irrigation.service");
const dto_1 = require("./dto");
const enums_1 = require("../common/enums");
const dayjs_1 = __importDefault(require("dayjs"));
let RotationalIrrigationController = class RotationalIrrigationController {
    constructor(service) {
        this.service = service;
    }
    createSeason(dto) {
        return this.service.createSeason(dto);
    }
    async listSeasons() {
        const seasons = await this.service.listSeasons();
        return seasons.map((s) => ({
            ...s,
            rounds: s.rounds.map((r) => ({
                ...r,
                status: this.service.computeRoundStatus(r.startDate, r.endDate),
                statusName: enums_1.IrrigationRoundStatusNames[this.service.computeRoundStatus(r.startDate, r.endDate)],
            })),
        }));
    }
    async getSeason(id) {
        const season = await this.service.getSeason(id);
        return {
            ...season,
            rounds: season.rounds.map((r) => ({
                ...r,
                status: this.service.computeRoundStatus(r.startDate, r.endDate),
                statusName: enums_1.IrrigationRoundStatusNames[this.service.computeRoundStatus(r.startDate, r.endDate)],
            })),
        };
    }
    removeSeason(id) {
        return this.service.removeSeason(id);
    }
    async createRound(dto) {
        const round = await this.service.createRound(dto);
        return {
            ...round,
            status: this.service.computeRoundStatus(round.startDate, round.endDate),
            statusName: enums_1.IrrigationRoundStatusNames[this.service.computeRoundStatus(round.startDate, round.endDate)],
        };
    }
    async updateRound(id, dto) {
        const round = await this.service.updateRound(id, dto);
        return {
            ...round,
            status: this.service.computeRoundStatus(round.startDate, round.endDate),
            statusName: enums_1.IrrigationRoundStatusNames[this.service.computeRoundStatus(round.startDate, round.endDate)],
        };
    }
    async listRounds(seasonId, status) {
        const rounds = await this.service.listRounds(seasonId, status);
        return rounds.map((r) => ({
            ...r,
            status: this.service.computeRoundStatus(r.startDate, r.endDate),
            statusName: enums_1.IrrigationRoundStatusNames[this.service.computeRoundStatus(r.startDate, r.endDate)],
        }));
    }
    async getRound(id) {
        const round = await this.service.getRound(id);
        return {
            ...round,
            status: this.service.computeRoundStatus(round.startDate, round.endDate),
            statusName: enums_1.IrrigationRoundStatusNames[this.service.computeRoundStatus(round.startDate, round.endDate)],
        };
    }
    removeRound(id) {
        return this.service.removeRound(id);
    }
    getRoundWaterUsage(id) {
        return this.service.getRoundWaterUsage(id);
    }
    getRoundSummary(id) {
        return this.service.getRoundSummary(id);
    }
    async getFarmerRoundInfo(farmerId) {
        const farmer = await this.service['prisma'].farmer.findUnique({
            where: { id: farmerId },
            include: { channel: true },
        });
        if (!farmer) {
            return { error: '用水户不存在' };
        }
        const activeRound = await this.service.findActiveRoundForChannel(farmer.channelId);
        const nextRound = await this.service.findNextRoundForChannel(farmer.channelId);
        return {
            farmer: { id: farmer.id, name: farmer.name, channel: farmer.channel },
            activeRound: activeRound
                ? {
                    ...activeRound,
                    status: this.service.computeRoundStatus(activeRound.startDate, activeRound.endDate),
                    statusName: enums_1.IrrigationRoundStatusNames[this.service.computeRoundStatus(activeRound.startDate, activeRound.endDate)],
                }
                : null,
            nextRound: nextRound
                ? {
                    ...nextRound,
                    status: this.service.computeRoundStatus(nextRound.startDate, nextRound.endDate),
                    statusName: enums_1.IrrigationRoundStatusNames[this.service.computeRoundStatus(nextRound.startDate, nextRound.endDate)],
                    startDateText: (0, dayjs_1.default)(nextRound.startDate).format('YYYY-MM-DD'),
                }
                : null,
        };
    }
};
exports.RotationalIrrigationController = RotationalIrrigationController;
__decorate([
    (0, common_1.Post)('seasons'),
    (0, swagger_1.ApiOperation)({ summary: '创建灌溉季' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateIrrigationSeasonDto]),
    __metadata("design:returntype", void 0)
], RotationalIrrigationController.prototype, "createSeason", null);
__decorate([
    (0, common_1.Get)('seasons'),
    (0, swagger_1.ApiOperation)({ summary: '查询灌溉季列表' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RotationalIrrigationController.prototype, "listSeasons", null);
__decorate([
    (0, common_1.Get)('seasons/:id'),
    (0, swagger_1.ApiOperation)({ summary: '查询灌溉季详情' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RotationalIrrigationController.prototype, "getSeason", null);
__decorate([
    (0, common_1.Delete)('seasons/:id'),
    (0, swagger_1.ApiOperation)({ summary: '删除灌溉季' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RotationalIrrigationController.prototype, "removeSeason", null);
__decorate([
    (0, common_1.Post)('rounds'),
    (0, swagger_1.ApiOperation)({ summary: '创建轮次(自动展开子渠道,校验日期不重叠、渠道不重复)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateIrrigationRoundDto]),
    __metadata("design:returntype", Promise)
], RotationalIrrigationController.prototype, "createRound", null);
__decorate([
    (0, common_1.Put)('rounds/:id'),
    (0, swagger_1.ApiOperation)({ summary: '更新轮次' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateIrrigationRoundDto]),
    __metadata("design:returntype", Promise)
], RotationalIrrigationController.prototype, "updateRound", null);
__decorate([
    (0, common_1.Get)('rounds'),
    (0, swagger_1.ApiOperation)({ summary: '查询轮次列表(状态自动计算)' }),
    (0, swagger_1.ApiQuery)({ name: 'seasonId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: enums_1.IrrigationRoundStatus }),
    __param(0, (0, common_1.Query)('seasonId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RotationalIrrigationController.prototype, "listRounds", null);
__decorate([
    (0, common_1.Get)('rounds/:id'),
    (0, swagger_1.ApiOperation)({ summary: '查询轮次详情' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RotationalIrrigationController.prototype, "getRound", null);
__decorate([
    (0, common_1.Delete)('rounds/:id'),
    (0, swagger_1.ApiOperation)({ summary: '删除轮次' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RotationalIrrigationController.prototype, "removeRound", null);
__decorate([
    (0, common_1.Get)('rounds/:id/water-usage'),
    (0, swagger_1.ApiOperation)({ summary: '查询轮次水量使用情况(已用量、剩余量、进度百分比、预警等级)' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RotationalIrrigationController.prototype, "getRoundWaterUsage", null);
__decorate([
    (0, common_1.Get)('rounds/:id/summary'),
    (0, swagger_1.ApiOperation)({ summary: '轮次用水汇总(各渠道计划量、实际量、效率、是否超上限)' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RotationalIrrigationController.prototype, "getRoundSummary", null);
__decorate([
    (0, common_1.Get)('farmer/:farmerId/current-round'),
    (0, swagger_1.ApiOperation)({ summary: '查询用水户当前/下一轮次信息' }),
    (0, swagger_1.ApiParam)({ name: 'farmerId' }),
    __param(0, (0, common_1.Param)('farmerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RotationalIrrigationController.prototype, "getFarmerRoundInfo", null);
exports.RotationalIrrigationController = RotationalIrrigationController = __decorate([
    (0, swagger_1.ApiTags)('轮灌管控'),
    (0, common_1.Controller)('rotational-irrigation'),
    __metadata("design:paramtypes", [rotational_irrigation_service_1.RotationalIrrigationService])
], RotationalIrrigationController);
//# sourceMappingURL=rotational-irrigation.controller.js.map