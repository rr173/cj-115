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
exports.AccountingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const accounting_service_1 = require("./accounting.service");
const dto_1 = require("./dto");
let AccountingController = class AccountingController {
    constructor(service) {
        this.service = service;
    }
    reportUsage(dto) {
        return this.service.reportUsage(dto);
    }
    getDeviationList(dateFrom, dateTo) {
        return this.service.getFarmerDeviationList(dateFrom, dateTo);
    }
    getChannelBalance(date) {
        return this.service.getChannelWaterBalance(date);
    }
    getFarmerUsage(farmerId, dateFrom, dateTo) {
        return this.service.getFarmerUsageSummary(farmerId, dateFrom, dateTo);
    }
};
exports.AccountingController = AccountingController;
__decorate([
    (0, common_1.Post)('report-usage'),
    (0, swagger_1.ApiOperation)({ summary: '用水户上报实际用水量(计算偏差率:超用>110%,浪费<60%)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ReportUsageDto]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "reportUsage", null);
__decorate([
    (0, common_1.Get)('deviations'),
    (0, swagger_1.ApiOperation)({ summary: '查询用水偏差列表(超用/浪费标记)' }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', required: false }),
    __param(0, (0, common_1.Query)('dateFrom')),
    __param(1, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getDeviationList", null);
__decorate([
    (0, common_1.Get)('balance'),
    (0, swagger_1.ApiOperation)({ summary: '按渠道汇总的水量平衡报表(入口供水量/各级分水量/末端用量/渗漏损耗)' }),
    (0, swagger_1.ApiQuery)({ name: 'date', description: '日期 YYYY-MM-DD', required: true }),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getChannelBalance", null);
__decorate([
    (0, common_1.Get)('farmer/:farmerId'),
    (0, swagger_1.ApiOperation)({ summary: '用水户用水汇总(含计划量、实际量、偏差评价)' }),
    (0, swagger_1.ApiParam)({ name: 'farmerId' }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', required: false }),
    __param(0, (0, common_1.Param)('farmerId')),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getFarmerUsage", null);
exports.AccountingController = AccountingController = __decorate([
    (0, swagger_1.ApiTags)('水量核算'),
    (0, common_1.Controller)('accounting'),
    __metadata("design:paramtypes", [accounting_service_1.AccountingService])
], AccountingController);
//# sourceMappingURL=accounting.controller.js.map