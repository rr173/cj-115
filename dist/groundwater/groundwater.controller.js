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
exports.GroundwaterController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const groundwater_service_1 = require("./groundwater.service");
const dto_1 = require("./dto");
let GroundwaterController = class GroundwaterController {
    constructor(service) {
        this.service = service;
    }
    createZone(dto) {
        return this.service.createIrrigationZone(dto);
    }
    updateZone(zoneId, dto) {
        return this.service.updateIrrigationZone(zoneId, dto);
    }
    listZones() {
        return this.service.listIrrigationZones();
    }
    addZoneChannel(dto) {
        return this.service.addZoneChannel(dto);
    }
    removeZoneChannel(zoneId, channelId) {
        return this.service.removeZoneChannel(zoneId, channelId);
    }
    getZoneChannels(zoneId) {
        return this.service.getZoneChannels(zoneId);
    }
    getZoneLedger(zoneId, year) {
        return this.service.getZoneWaterLedger(zoneId, year ? parseInt(year) : undefined);
    }
    adjustRedline(dto) {
        return this.service.adjustRedline(dto);
    }
    recordWaterLevelDepth(dto) {
        return this.service.recordWaterLevelDepth(dto);
    }
    createWell(dto) {
        return this.service.createPumpingWell(dto);
    }
    updateWell(wellId, dto) {
        return this.service.updatePumpingWell(wellId, dto);
    }
    listWells(zoneId) {
        return this.service.listPumpingWells(zoneId);
    }
    getWellHistory(wellId, dateFrom, dateTo) {
        return this.service.getPumpingWellHistory(wellId, dateFrom, dateTo);
    }
    generatePlan(dto) {
        return this.service.generateJointSupplyPlan(dto);
    }
    executePlan(dto) {
        return this.service.executeJointSupply(dto);
    }
    getSupplyPlan(applicationId) {
        return this.service.getJointSupplyPlan(applicationId);
    }
    listAlerts(zoneId, resolved) {
        const isResolved = resolved === undefined ? undefined : resolved === 'true';
        return this.service.listAlerts(zoneId, isResolved);
    }
    registerMeter(dto) {
        return this.service.registerSmartMeter(dto);
    }
    updateMeter(meterId, dto) {
        return this.service.updateSmartMeter(meterId, dto);
    }
    listMeters(zoneId) {
        return this.service.listSmartMeters(zoneId);
    }
    getMeter(meterId) {
        return this.service.getSmartMeter(meterId);
    }
    updateCoefficient(dto) {
        return this.service.updateCoefficient(dto);
    }
    reportReading(dto) {
        return this.service.reportMeterReading(dto);
    }
    listReadings(wellId, meterId, dateFrom, dateTo) {
        return this.service.listMeterReadings(wellId, meterId, dateFrom, dateTo);
    }
    listAbnormalAlerts(resolved) {
        const isResolved = resolved === undefined ? undefined : resolved === 'true';
        return this.service.listMeterAbnormalAlerts(isResolved);
    }
    resolveAbnormal(dto) {
        return this.service.resolveMeterAbnormal(dto);
    }
    createQuota(dto) {
        return this.service.createElectricityQuota(dto);
    }
    updateQuota(quotaId, dto) {
        return this.service.updateElectricityQuota(quotaId, dto);
    }
    listQuotas(zoneId) {
        return this.service.listElectricityQuotas(zoneId);
    }
    getQuotaUsage(quotaId) {
        return this.service.getElectricityQuotaUsage(quotaId);
    }
    getWellReconciliation(wellId, dateFrom, dateTo) {
        return this.service.getWellReconciliation(wellId, dateFrom, dateTo);
    }
    getZoneReconciliation(zoneId, dateFrom, dateTo) {
        return this.service.getZoneReconciliation(zoneId, dateFrom, dateTo);
    }
};
exports.GroundwaterController = GroundwaterController;
__decorate([
    (0, common_1.Post)('zones'),
    (0, swagger_1.ApiOperation)({ summary: '创建灌溉分区' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateIrrigationZoneDto]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "createZone", null);
__decorate([
    (0, common_1.Put)('zones/:zoneId'),
    (0, swagger_1.ApiOperation)({ summary: '更新灌溉分区基本信息' }),
    (0, swagger_1.ApiParam)({ name: 'zoneId', description: '分区ID' }),
    __param(0, (0, common_1.Param)('zoneId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateIrrigationZoneDto]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "updateZone", null);
__decorate([
    (0, common_1.Get)('zones'),
    (0, swagger_1.ApiOperation)({ summary: '查询所有灌溉分区列表' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "listZones", null);
__decorate([
    (0, common_1.Post)('zones/channels'),
    (0, swagger_1.ApiOperation)({ summary: '为分区添加覆盖的农渠(一条农渠只能属于一个分区)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AddZoneChannelDto]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "addZoneChannel", null);
__decorate([
    (0, common_1.Delete)('zones/:zoneId/channels/:channelId'),
    (0, swagger_1.ApiOperation)({ summary: '移除分区覆盖的农渠' }),
    (0, swagger_1.ApiParam)({ name: 'zoneId', description: '分区ID' }),
    (0, swagger_1.ApiParam)({ name: 'channelId', description: '渠道ID' }),
    __param(0, (0, common_1.Param)('zoneId')),
    __param(1, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "removeZoneChannel", null);
__decorate([
    (0, common_1.Get)('zones/:zoneId/channels'),
    (0, swagger_1.ApiOperation)({ summary: '查询分区覆盖的农渠列表' }),
    (0, swagger_1.ApiParam)({ name: 'zoneId', description: '分区ID' }),
    __param(0, (0, common_1.Param)('zoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "getZoneChannels", null);
__decorate([
    (0, common_1.Get)('zones/:zoneId/ledger'),
    (0, swagger_1.ApiOperation)({ summary: '查询分区水资源台账(地表水供水量、地下水开采量、红线剩余、当前埋深、超采状态)' }),
    (0, swagger_1.ApiParam)({ name: 'zoneId', description: '分区ID' }),
    (0, swagger_1.ApiQuery)({ name: 'year', description: '年度,默认当前年', required: false }),
    __param(0, (0, common_1.Param)('zoneId')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "getZoneLedger", null);
__decorate([
    (0, common_1.Patch)('zones/adjust-redline'),
    (0, swagger_1.ApiOperation)({ summary: '手动调整分区年度开采红线' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AdjustRedlineDto]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "adjustRedline", null);
__decorate([
    (0, common_1.Post)('zones/record-depth'),
    (0, swagger_1.ApiOperation)({ summary: '录入最新实测地下水位埋深' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RecordWaterLevelDepthDto]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "recordWaterLevelDepth", null);
__decorate([
    (0, common_1.Post)('wells'),
    (0, swagger_1.ApiOperation)({ summary: '注册机井' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreatePumpingWellDto]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "createWell", null);
__decorate([
    (0, common_1.Put)('wells/:wellId'),
    (0, swagger_1.ApiOperation)({ summary: '更新机井信息' }),
    (0, swagger_1.ApiParam)({ name: 'wellId', description: '机井ID' }),
    __param(0, (0, common_1.Param)('wellId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdatePumpingWellDto]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "updateWell", null);
__decorate([
    (0, common_1.Get)('wells'),
    (0, swagger_1.ApiOperation)({ summary: '查询机井列表' }),
    (0, swagger_1.ApiQuery)({ name: 'zoneId', description: '按分区筛选', required: false }),
    __param(0, (0, common_1.Query)('zoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "listWells", null);
__decorate([
    (0, common_1.Get)('wells/:wellId/history'),
    (0, swagger_1.ApiOperation)({ summary: '查询某口机井的开采历史记录' }),
    (0, swagger_1.ApiParam)({ name: 'wellId', description: '机井ID' }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', description: '起始日期 YYYY-MM-DD', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', description: '结束日期 YYYY-MM-DD', required: false }),
    __param(0, (0, common_1.Param)('wellId')),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "getWellHistory", null);
__decorate([
    (0, common_1.Post)('supply/plan'),
    (0, swagger_1.ApiOperation)({ summary: '生成井渠联合供水方案(仅评估不执行)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GenerateJointSupplyPlanDto]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "generatePlan", null);
__decorate([
    (0, common_1.Post)('supply/execute'),
    (0, swagger_1.ApiOperation)({ summary: '执行井渠联合供水方案(生成开采记录、更新分区台账)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GenerateJointSupplyPlanDto]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "executePlan", null);
__decorate([
    (0, common_1.Get)('supply/plan/:applicationId'),
    (0, swagger_1.ApiOperation)({ summary: '查询某次配水需求的井渠联合供水方案明细' }),
    (0, swagger_1.ApiParam)({ name: 'applicationId', description: '用水申请ID' }),
    __param(0, (0, common_1.Param)('applicationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "getSupplyPlan", null);
__decorate([
    (0, common_1.Get)('alerts'),
    (0, swagger_1.ApiOperation)({ summary: '查询地下水告警列表' }),
    (0, swagger_1.ApiQuery)({ name: 'zoneId', description: '按分区筛选', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'resolved', description: '是否已解决', required: false }),
    __param(0, (0, common_1.Query)('zoneId')),
    __param(1, (0, common_1.Query)('resolved')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "listAlerts", null);
__decorate([
    (0, common_1.Post)('meters'),
    (0, swagger_1.ApiOperation)({ summary: '为机井登记智能电表' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RegisterSmartMeterDto]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "registerMeter", null);
__decorate([
    (0, common_1.Put)('meters/:meterId'),
    (0, swagger_1.ApiOperation)({ summary: '更新电表信息' }),
    (0, swagger_1.ApiParam)({ name: 'meterId', description: '电表ID' }),
    __param(0, (0, common_1.Param)('meterId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateSmartMeterDto]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "updateMeter", null);
__decorate([
    (0, common_1.Get)('meters'),
    (0, swagger_1.ApiOperation)({ summary: '查询智能电表列表' }),
    (0, swagger_1.ApiQuery)({ name: 'zoneId', description: '按分区筛选', required: false }),
    __param(0, (0, common_1.Query)('zoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "listMeters", null);
__decorate([
    (0, common_1.Get)('meters/:meterId'),
    (0, swagger_1.ApiOperation)({ summary: '查询单块电表详情' }),
    (0, swagger_1.ApiParam)({ name: 'meterId', description: '电表ID' }),
    __param(0, (0, common_1.Param)('meterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "getMeter", null);
__decorate([
    (0, common_1.Patch)('wells/coefficient'),
    (0, swagger_1.ApiOperation)({ summary: '更新机井以电折水系数' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UpdateCoefficientDto]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "updateCoefficient", null);
__decorate([
    (0, common_1.Post)('meters/readings'),
    (0, swagger_1.ApiOperation)({ summary: '上报电表读数(自动折算抽水量,校验电量配额)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ReportMeterReadingDto]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "reportReading", null);
__decorate([
    (0, common_1.Get)('meters/readings'),
    (0, swagger_1.ApiOperation)({ summary: '查询电表读数上报流水' }),
    (0, swagger_1.ApiQuery)({ name: 'wellId', description: '按机井筛选', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'meterId', description: '按电表筛选', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', description: '起始日期 YYYY-MM-DD', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', description: '结束日期 YYYY-MM-DD', required: false }),
    __param(0, (0, common_1.Query)('wellId')),
    __param(1, (0, common_1.Query)('meterId')),
    __param(2, (0, common_1.Query)('dateFrom')),
    __param(3, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "listReadings", null);
__decorate([
    (0, common_1.Get)('meters/abnormal-alerts'),
    (0, swagger_1.ApiOperation)({ summary: '查询电表异常告警列表' }),
    (0, swagger_1.ApiQuery)({ name: 'resolved', description: '是否已处理', required: false }),
    __param(0, (0, common_1.Query)('resolved')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "listAbnormalAlerts", null);
__decorate([
    (0, common_1.Post)('meters/abnormal-alerts/resolve'),
    (0, swagger_1.ApiOperation)({ summary: '处理电表异常告警(核定新基准读数,恢复计量)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ResolveMeterAbnormalDto]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "resolveAbnormal", null);
__decorate([
    (0, common_1.Post)('electricity-quotas'),
    (0, swagger_1.ApiOperation)({ summary: '创建分区灌溉季电量配额' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateElectricityQuotaDto]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "createQuota", null);
__decorate([
    (0, common_1.Put)('electricity-quotas/:quotaId'),
    (0, swagger_1.ApiOperation)({ summary: '调整电量配额(扩配)' }),
    (0, swagger_1.ApiParam)({ name: 'quotaId', description: '配额ID' }),
    __param(0, (0, common_1.Param)('quotaId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateElectricityQuotaDto]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "updateQuota", null);
__decorate([
    (0, common_1.Get)('electricity-quotas'),
    (0, swagger_1.ApiOperation)({ summary: '查询电量配额列表' }),
    (0, swagger_1.ApiQuery)({ name: 'zoneId', description: '按分区筛选', required: false }),
    __param(0, (0, common_1.Query)('zoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "listQuotas", null);
__decorate([
    (0, common_1.Get)('electricity-quotas/:quotaId/usage'),
    (0, swagger_1.ApiOperation)({ summary: '查询电量配额使用详情及各井耗电明细' }),
    (0, swagger_1.ApiParam)({ name: 'quotaId', description: '配额ID' }),
    __param(0, (0, common_1.Param)('quotaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "getQuotaUsage", null);
__decorate([
    (0, common_1.Get)('wells/:wellId/reconciliation'),
    (0, swagger_1.ApiOperation)({ summary: '查询单口机电折水与推算量对账报表' }),
    (0, swagger_1.ApiParam)({ name: 'wellId', description: '机井ID' }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', description: '起始日期 YYYY-MM-DD', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', description: '结束日期 YYYY-MM-DD', required: false }),
    __param(0, (0, common_1.Param)('wellId')),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "getWellReconciliation", null);
__decorate([
    (0, common_1.Get)('zones/:zoneId/reconciliation'),
    (0, swagger_1.ApiOperation)({ summary: '查询分区电折水与推算量对账汇总报表(含各井明细)' }),
    (0, swagger_1.ApiParam)({ name: 'zoneId', description: '分区ID' }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', description: '起始日期 YYYY-MM-DD', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', description: '结束日期 YYYY-MM-DD', required: false }),
    __param(0, (0, common_1.Param)('zoneId')),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], GroundwaterController.prototype, "getZoneReconciliation", null);
exports.GroundwaterController = GroundwaterController = __decorate([
    (0, swagger_1.ApiTags)('机井补源与地下水开采管控'),
    (0, common_1.Controller)('groundwater'),
    __metadata("design:paramtypes", [groundwater_service_1.GroundwaterService])
], GroundwaterController);
//# sourceMappingURL=groundwater.controller.js.map