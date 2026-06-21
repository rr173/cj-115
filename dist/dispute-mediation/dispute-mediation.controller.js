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
exports.DisputeMediationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dispute_mediation_service_1 = require("./dispute-mediation.service");
const dto_1 = require("./dto");
const enums_1 = require("../common/enums");
let DisputeMediationController = class DisputeMediationController {
    constructor(service) {
        this.service = service;
    }
    create(dto) {
        return this.service.createDispute(dto);
    }
    findAll(dto) {
        return this.service.queryDisputes(dto);
    }
    getFarmerDisputes(farmerId) {
        return this.service.getFarmerDisputes(farmerId);
    }
    getQuarterlyStats(dto) {
        return this.service.getQuarterlyStats(dto);
    }
    findOne(id) {
        return this.service.getDisputeDetail(id);
    }
    accept(id, dto) {
        return this.service.acceptDispute(id, dto);
    }
    addMediationRecord(id, dto) {
        return this.service.addMediationRecord(id, dto);
    }
    close(id, dto) {
        return this.service.closeDispute(id, dto);
    }
    reopen(id) {
        return this.service.reopenDispute(id);
    }
    archive(id) {
        return this.service.archiveDispute(id);
    }
    triggerQuarterlyCreditPenalty(year, quarter) {
        return this.service.triggerQuarterlyCreditPenalty(parseInt(year, 10), quarter);
    }
    triggerAllQuarterlyCreditPenalty() {
        return this.service.triggerAllQuarterlyCreditPenalty();
    }
};
exports.DisputeMediationController = DisputeMediationController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '登记纠纷事件' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateDisputeDto]),
    __metadata("design:returntype", void 0)
], DisputeMediationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '查询纠纷列表(支持按时间/类型/状态/超期筛选)' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', description: '开始日期 YYYY-MM-DD', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', description: '结束日期 YYYY-MM-DD', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'type', description: '纠纷类型', enum: enums_1.DisputeType, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', description: '状态', enum: enums_1.DisputeStatus, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'isOverdue', description: '是否超期', type: Boolean, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', description: '页码', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', description: '每页条数', type: Number, required: false }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryDisputesDto]),
    __metadata("design:returntype", void 0)
], DisputeMediationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('farmer/:farmerId'),
    (0, swagger_1.ApiOperation)({ summary: '查询某用水户涉及的所有纠纷历史' }),
    (0, swagger_1.ApiParam)({ name: 'farmerId', description: '用水户ID' }),
    __param(0, (0, common_1.Param)('farmerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DisputeMediationController.prototype, "getFarmerDisputes", null);
__decorate([
    (0, common_1.Get)('statistics/quarterly'),
    (0, swagger_1.ApiOperation)({ summary: '按季度统计各类型纠纷数量和平均处理天数' }),
    (0, swagger_1.ApiQuery)({ name: 'year', description: '年份', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'quarter', description: '季度(Q1/Q2/Q3/Q4)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QuarterlyStatsDto]),
    __metadata("design:returntype", void 0)
], DisputeMediationController.prototype, "getQuarterlyStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '查询纠纷详情(含调解记录时间线和关联配水申请)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '纠纷ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DisputeMediationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/accept'),
    (0, swagger_1.ApiOperation)({ summary: '受理纠纷(指定调解员和预计处理天数)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '纠纷ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AcceptDisputeDto]),
    __metadata("design:returntype", void 0)
], DisputeMediationController.prototype, "accept", null);
__decorate([
    (0, common_1.Post)(':id/mediation-record'),
    (0, swagger_1.ApiOperation)({ summary: '追加调解记录' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '纠纷ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AddMediationRecordDto]),
    __metadata("design:returntype", void 0)
], DisputeMediationController.prototype, "addMediationRecord", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    (0, swagger_1.ApiOperation)({ summary: '结案(填写处理结论和说明)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '纠纷ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CloseDisputeDto]),
    __metadata("design:returntype", void 0)
], DisputeMediationController.prototype, "close", null);
__decorate([
    (0, common_1.Post)(':id/reopen'),
    (0, swagger_1.ApiOperation)({ summary: '重新打开纠纷(回到调解中,结案30天内可操作)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '纠纷ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DisputeMediationController.prototype, "reopen", null);
__decorate([
    (0, common_1.Post)(':id/archive'),
    (0, swagger_1.ApiOperation)({ summary: '手动归档纠纷' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '纠纷ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DisputeMediationController.prototype, "archive", null);
__decorate([
    (0, common_1.Post)('credit-penalty/trigger'),
    (0, swagger_1.ApiOperation)({ summary: '手动触发某季度纠纷信用扣分检查(按季度扫描所有涉及纠纷的用水户,达到阈值则扣分)' }),
    (0, swagger_1.ApiQuery)({ name: 'year', description: '年份', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'quarter', description: '季度(Q1/Q2/Q3/Q4)' }),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('quarter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DisputeMediationController.prototype, "triggerQuarterlyCreditPenalty", null);
__decorate([
    (0, common_1.Post)('credit-penalty/trigger-all'),
    (0, swagger_1.ApiOperation)({ summary: '手动触发本年度全部季度纠纷信用扣分检查' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DisputeMediationController.prototype, "triggerAllQuarterlyCreditPenalty", null);
exports.DisputeMediationController = DisputeMediationController = __decorate([
    (0, swagger_1.ApiTags)('用水纠纷调解与台账管理'),
    (0, common_1.Controller)('dispute-mediation'),
    __metadata("design:paramtypes", [dispute_mediation_service_1.DisputeMediationService])
], DisputeMediationController);
//# sourceMappingURL=dispute-mediation.controller.js.map