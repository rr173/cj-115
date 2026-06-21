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
exports.WaterLevelGateControlController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const water_level_gate_control_service_1 = require("./water-level-gate-control.service");
const dto_1 = require("./dto");
let WaterLevelGateControlController = class WaterLevelGateControlController {
    constructor(service) {
        this.service = service;
    }
    createMonitor(dto) {
        return this.service.createMonitor(dto);
    }
    getChannelMonitors(channelId) {
        return this.service.getChannelMonitors(channelId);
    }
    reportReadings(dto) {
        return this.service.reportReadings(dto);
    }
    getMonitorHistory(monitorId, startTime, endTime) {
        return this.service.getMonitorHistory(monitorId, startTime, endTime);
    }
    createGate(dto) {
        return this.service.createGate(dto);
    }
    getGateStatus(gateId) {
        return this.service.getGateStatus(gateId);
    }
    manualSetOpening(gateId, dto) {
        return this.service.manualSetOpening(gateId, dto);
    }
    switchGateMode(gateId, dto) {
        return this.service.switchGateMode(gateId, dto);
    }
    getAlerts(type, channelId, unresolvedOnly) {
        return this.service.getAlerts({
            type: type,
            channelId,
            unresolvedOnly: unresolvedOnly === 'true',
        });
    }
};
exports.WaterLevelGateControlController = WaterLevelGateControlController;
__decorate([
    (0, common_1.Post)('monitors'),
    (0, swagger_1.ApiOperation)({ summary: '注册水位监测点' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateMonitorDto]),
    __metadata("design:returntype", void 0)
], WaterLevelGateControlController.prototype, "createMonitor", null);
__decorate([
    (0, common_1.Get)('monitors/channel/:channelId'),
    (0, swagger_1.ApiOperation)({ summary: '查询某条渠道所有监测点的最新水位和状态' }),
    (0, swagger_1.ApiParam)({ name: 'channelId', description: '渠道ID' }),
    __param(0, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WaterLevelGateControlController.prototype, "getChannelMonitors", null);
__decorate([
    (0, common_1.Post)('readings'),
    (0, swagger_1.ApiOperation)({ summary: '批量上报水位读数，触发自动控制计算' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ReportReadingsDto]),
    __metadata("design:returntype", void 0)
], WaterLevelGateControlController.prototype, "reportReadings", null);
__decorate([
    (0, common_1.Get)('readings/:monitorId'),
    (0, swagger_1.ApiOperation)({ summary: '查询某监测点的历史水位记录(按时间范围)' }),
    (0, swagger_1.ApiParam)({ name: 'monitorId', description: '监测点ID' }),
    (0, swagger_1.ApiQuery)({ name: 'startTime', required: false, description: '开始时间' }),
    (0, swagger_1.ApiQuery)({ name: 'endTime', required: false, description: '结束时间' }),
    __param(0, (0, common_1.Param)('monitorId')),
    __param(1, (0, common_1.Query)('startTime')),
    __param(2, (0, common_1.Query)('endTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], WaterLevelGateControlController.prototype, "getMonitorHistory", null);
__decorate([
    (0, common_1.Post)('gates'),
    (0, swagger_1.ApiOperation)({ summary: '注册闸门(渠道起点进水闸)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateGateDto]),
    __metadata("design:returntype", void 0)
], WaterLevelGateControlController.prototype, "createGate", null);
__decorate([
    (0, common_1.Get)('gates/:gateId'),
    (0, swagger_1.ApiOperation)({ summary: '查询某闸门当前状态和最近调节记录' }),
    (0, swagger_1.ApiParam)({ name: 'gateId', description: '闸门ID' }),
    __param(0, (0, common_1.Param)('gateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WaterLevelGateControlController.prototype, "getGateStatus", null);
__decorate([
    (0, common_1.Put)('gates/:gateId/opening'),
    (0, swagger_1.ApiOperation)({ summary: '手动下发闸门开度指令(覆盖自动控制,持续到下一配水时段切换)' }),
    (0, swagger_1.ApiParam)({ name: 'gateId', description: '闸门ID' }),
    __param(0, (0, common_1.Param)('gateId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ManualGateOpeningDto]),
    __metadata("design:returntype", void 0)
], WaterLevelGateControlController.prototype, "manualSetOpening", null);
__decorate([
    (0, common_1.Put)('gates/:gateId/mode'),
    (0, swagger_1.ApiOperation)({ summary: '切换闸门控制模式(自动/手动)' }),
    (0, swagger_1.ApiParam)({ name: 'gateId', description: '闸门ID' }),
    __param(0, (0, common_1.Param)('gateId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.SwitchGateModeDto]),
    __metadata("design:returntype", void 0)
], WaterLevelGateControlController.prototype, "switchGateMode", null);
__decorate([
    (0, common_1.Get)('alerts'),
    (0, swagger_1.ApiOperation)({ summary: '查询当前所有告警(按类型和渠道筛选)' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, description: '告警类型: OVERFLOW/DRY/DEVICE_OFFLINE/ALL_OFFLINE' }),
    (0, swagger_1.ApiQuery)({ name: 'channelId', required: false, description: '渠道ID' }),
    (0, swagger_1.ApiQuery)({ name: 'unresolvedOnly', required: false, description: '是否只查未解决' }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('channelId')),
    __param(2, (0, common_1.Query)('unresolvedOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], WaterLevelGateControlController.prototype, "getAlerts", null);
exports.WaterLevelGateControlController = WaterLevelGateControlController = __decorate([
    (0, swagger_1.ApiTags)('渠道水位遥测与闸门联动控制'),
    (0, common_1.Controller)('water-level-gate-control'),
    __metadata("design:paramtypes", [water_level_gate_control_service_1.WaterLevelGateControlService])
], WaterLevelGateControlController);
//# sourceMappingURL=water-level-gate-control.controller.js.map