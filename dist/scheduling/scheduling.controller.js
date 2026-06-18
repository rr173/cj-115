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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const scheduling_service_1 = require("./scheduling.service");
let SchedulingController = class SchedulingController {
    constructor(service) {
        this.service = service;
    }
    runScheduling(date) {
        return this.service.runScheduling(date);
    }
    getDaySchedule(date) {
        return this.service.getDaySchedule(date);
    }
    getChannelSchedule(channelId, date) {
        return this.service.getChannelSchedule(channelId, date);
    }
};
exports.SchedulingController = SchedulingController;
__decorate([
    (0, common_1.Post)('run'),
    (0, swagger_1.ApiOperation)({ summary: '管理员触发某一天的配水编排(先到先得+30分钟步长延迟+传播延迟+流量约束)' }),
    (0, swagger_1.ApiQuery)({ name: 'date', description: '目标日期 YYYY-MM-DD', required: true }),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchedulingController.prototype, "runScheduling", null);
__decorate([
    (0, common_1.Get)('day'),
    (0, swagger_1.ApiOperation)({ summary: '查询某一天全渠网配水计划总表' }),
    (0, swagger_1.ApiQuery)({ name: 'date', description: '目标日期 YYYY-MM-DD', required: true }),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchedulingController.prototype, "getDaySchedule", null);
__decorate([
    (0, common_1.Get)('channel/:channelId'),
    (0, swagger_1.ApiOperation)({ summary: '按渠道查询某一天的时段占用情况(每30分钟时隙)' }),
    (0, swagger_1.ApiParam)({ name: 'channelId', description: '渠道ID' }),
    (0, swagger_1.ApiQuery)({ name: 'date', description: '目标日期 YYYY-MM-DD', required: true }),
    __param(0, (0, common_1.Param)('channelId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SchedulingController.prototype, "getChannelSchedule", null);
exports.SchedulingController = SchedulingController = __decorate([
    (0, swagger_1.ApiTags)('配水编排'),
    (0, common_1.Controller)('scheduling'),
    __metadata("design:paramtypes", [scheduling_service_1.SchedulingService])
], SchedulingController);
//# sourceMappingURL=scheduling.controller.js.map