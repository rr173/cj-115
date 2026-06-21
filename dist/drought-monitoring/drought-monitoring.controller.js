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
exports.DroughtMonitoringController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const drought_monitoring_service_1 = require("./drought-monitoring.service");
const dto_1 = require("./dto");
let DroughtMonitoringController = class DroughtMonitoringController {
    constructor(service) {
        this.service = service;
    }
    reportWaterSource(dto) {
        return this.service.reportWaterSource(dto);
    }
    getStatus() {
        return this.service.getStatus();
    }
    getDroughtEvents(level, startTime, endTime) {
        return this.service.getDroughtEvents({
            level: level,
            startTime,
            endTime,
        });
    }
    getAffectedAllocations() {
        return this.service.getAffectedAllocations();
    }
    manualTriggerEmergency() {
        return this.service.manualTriggerEmergency();
    }
    manualLiftEmergency() {
        return this.service.manualLiftEmergency();
    }
    createChannelTransfer(dto) {
        return this.service.createChannelTransfer(dto);
    }
    getChannelTransfers(status) {
        return this.service.getChannelTransfers({
            status: status,
        });
    }
    getSupplyDemandTrend(startTime, endTime) {
        return this.service.getSupplyDemandTrend({ startTime, endTime });
    }
    getChannelEffectiveCapacity(channelId) {
        return this.service.getChannelEffectiveCapacity(channelId);
    }
};
exports.DroughtMonitoringController = DroughtMonitoringController;
__decorate([
    (0, common_1.Post)('source-report'),
    (0, swagger_1.ApiOperation)({ summary: '上报水源流量(干渠入口来水量),触发供需比计算和应急响应判断' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ReportWaterSourceDto]),
    __metadata("design:returntype", void 0)
], DroughtMonitoringController.prototype, "reportWaterSource", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: '查询当前供需比和旱情状态' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DroughtMonitoringController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('events'),
    (0, swagger_1.ApiOperation)({ summary: '查询旱情事件历史(按等级和时间范围)' }),
    (0, swagger_1.ApiQuery)({ name: 'level', required: false, description: '旱情等级: ABUNDANT/NORMAL/TENSE/SEVERE' }),
    (0, swagger_1.ApiQuery)({ name: 'startTime', required: false, description: '开始时间' }),
    (0, swagger_1.ApiQuery)({ name: 'endTime', required: false, description: '结束时间' }),
    __param(0, (0, common_1.Query)('level')),
    __param(1, (0, common_1.Query)('startTime')),
    __param(2, (0, common_1.Query)('endTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], DroughtMonitoringController.prototype, "getDroughtEvents", null);
__decorate([
    (0, common_1.Get)('affected-allocations'),
    (0, swagger_1.ApiOperation)({ summary: '查询当前被暂停和被削减的配水计划列表' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DroughtMonitoringController.prototype, "getAffectedAllocations", null);
__decorate([
    (0, common_1.Post)('trigger-emergency'),
    (0, swagger_1.ApiOperation)({ summary: '手动触发应急响应(不等自动触发)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DroughtMonitoringController.prototype, "manualTriggerEmergency", null);
__decorate([
    (0, common_1.Post)('lift-emergency'),
    (0, swagger_1.ApiOperation)({ summary: '手动解除应急状态(强制恢复所有计划)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DroughtMonitoringController.prototype, "manualLiftEmergency", null);
__decorate([
    (0, common_1.Post)('channel-transfers'),
    (0, swagger_1.ApiOperation)({ summary: '创建渠道借调关系(空闲渠道借调给缺水渠道)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateChannelTransferDto]),
    __metadata("design:returntype", void 0)
], DroughtMonitoringController.prototype, "createChannelTransfer", null);
__decorate([
    (0, common_1.Get)('channel-transfers'),
    (0, swagger_1.ApiOperation)({ summary: '查询渠道借调关系' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: '借调状态: ACTIVE/RELEASED' }),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DroughtMonitoringController.prototype, "getChannelTransfers", null);
__decorate([
    (0, common_1.Get)('supply-demand-trend'),
    (0, swagger_1.ApiOperation)({ summary: '查询供需比趋势(按小时聚合)' }),
    (0, swagger_1.ApiQuery)({ name: 'startTime', required: true, description: '开始时间' }),
    (0, swagger_1.ApiQuery)({ name: 'endTime', required: true, description: '结束时间' }),
    __param(0, (0, common_1.Query)('startTime')),
    __param(1, (0, common_1.Query)('endTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DroughtMonitoringController.prototype, "getSupplyDemandTrend", null);
__decorate([
    (0, common_1.Get)('channel-effective-capacity'),
    (0, swagger_1.ApiOperation)({ summary: '查询渠道有效容量(含借调容量)' }),
    (0, swagger_1.ApiQuery)({ name: 'channelId', required: true, description: '渠道ID' }),
    __param(0, (0, common_1.Query)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DroughtMonitoringController.prototype, "getChannelEffectiveCapacity", null);
exports.DroughtMonitoringController = DroughtMonitoringController = __decorate([
    (0, swagger_1.ApiTags)('旱情监测与应急调水'),
    (0, common_1.Controller)('drought-monitoring'),
    __metadata("design:paramtypes", [drought_monitoring_service_1.DroughtMonitoringService])
], DroughtMonitoringController);
//# sourceMappingURL=drought-monitoring.controller.js.map