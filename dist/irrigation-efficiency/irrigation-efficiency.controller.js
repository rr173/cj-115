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
exports.IrrigationEfficiencyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const irrigation_efficiency_service_1 = require("./irrigation-efficiency.service");
const dto_1 = require("./dto");
const enums_1 = require("../common/enums");
let IrrigationEfficiencyController = class IrrigationEfficiencyController {
    constructor(service) {
        this.service = service;
    }
    getChannelCoefficient(channelId) {
        return this.service.getChannelCoefficient(channelId);
    }
    updateChannelCoefficient(channelId, dto) {
        return this.service.updateChannelCoefficient(channelId, dto);
    }
    getAllocationEfficiency(applicationId) {
        return this.service.getAllocationEfficiencyDetail(applicationId);
    }
    getFarmerEfficiencyHistory(farmerId, dateFrom, dateTo, page, pageSize) {
        const dto = {
            farmerId,
            dateFrom,
            dateTo,
            page: page ? parseInt(page, 10) : undefined,
            pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
        };
        return this.service.getFarmerEfficiencyHistory(dto);
    }
    getQuarterlyAssessment(year, quarter) {
        return this.service.getQuarterlyAssessment(parseInt(year, 10), quarter);
    }
    triggerAssessment(dto) {
        return this.service.triggerQuarterlyAssessment(dto);
    }
};
exports.IrrigationEfficiencyController = IrrigationEfficiencyController;
__decorate([
    (0, common_1.Get)('channel/:channelId/coefficient'),
    (0, swagger_1.ApiOperation)({ summary: '查询渠道水利用系数和综合系数(从干渠到该渠道的连乘值)' }),
    (0, swagger_1.ApiParam)({ name: 'channelId', description: '渠道ID' }),
    __param(0, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IrrigationEfficiencyController.prototype, "getChannelCoefficient", null);
__decorate([
    (0, common_1.Put)('channel/:channelId/coefficient'),
    (0, swagger_1.ApiOperation)({ summary: '修改渠道水利用系数(0~1之间)' }),
    (0, swagger_1.ApiParam)({ name: 'channelId', description: '渠道ID' }),
    __param(0, (0, common_1.Param)('channelId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateChannelCoefficientDto]),
    __metadata("design:returntype", void 0)
], IrrigationEfficiencyController.prototype, "updateChannelCoefficient", null);
__decorate([
    (0, common_1.Get)('allocation/:applicationId'),
    (0, swagger_1.ApiOperation)({ summary: '查询某次配水的效率明细(计划量/理论到田/实际用水/偏差率)' }),
    (0, swagger_1.ApiParam)({ name: 'applicationId', description: '用水申请ID' }),
    __param(0, (0, common_1.Param)('applicationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IrrigationEfficiencyController.prototype, "getAllocationEfficiency", null);
__decorate([
    (0, common_1.Get)('farmer/:farmerId/history'),
    (0, swagger_1.ApiOperation)({ summary: '按时间范围查询某用水户的历史效率记录' }),
    (0, swagger_1.ApiParam)({ name: 'farmerId', description: '用水户ID' }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', description: '开始日期 YYYY-MM-DD', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', description: '结束日期 YYYY-MM-DD', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', description: '页码(从1开始)', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', description: '每页条数', required: false, type: Number }),
    __param(0, (0, common_1.Param)('farmerId')),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], IrrigationEfficiencyController.prototype, "getFarmerEfficiencyHistory", null);
__decorate([
    (0, common_1.Get)('assessment'),
    (0, swagger_1.ApiOperation)({ summary: '查询某季度的考核报告(渠道维度和用水户维度)' }),
    (0, swagger_1.ApiQuery)({ name: 'year', description: '年份', required: true, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'quarter', description: '季度 Q1/Q2/Q3/Q4', required: true, enum: enums_1.QuotaQuarter }),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('quarter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], IrrigationEfficiencyController.prototype, "getQuarterlyAssessment", null);
__decorate([
    (0, common_1.Post)('assessment/trigger'),
    (0, swagger_1.ApiOperation)({ summary: '手动触发季度考核(不等季度末自动执行)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TriggerAssessmentDto]),
    __metadata("design:returntype", void 0)
], IrrigationEfficiencyController.prototype, "triggerAssessment", null);
exports.IrrigationEfficiencyController = IrrigationEfficiencyController = __decorate([
    (0, swagger_1.ApiTags)('灌溉效率与节水考核'),
    (0, common_1.Controller)('irrigation-efficiency'),
    __metadata("design:paramtypes", [irrigation_efficiency_service_1.IrrigationEfficiencyService])
], IrrigationEfficiencyController);
//# sourceMappingURL=irrigation-efficiency.controller.js.map