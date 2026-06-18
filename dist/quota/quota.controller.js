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
exports.QuotaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const quota_service_1 = require("./quota.service");
const dto_1 = require("./dto");
const enums_1 = require("../common/enums");
let QuotaController = class QuotaController {
    constructor(service) {
        this.service = service;
    }
    setQuota(dto) {
        return this.service.setQuota(dto);
    }
    async batchSet(dto) {
        const results = [];
        for (const item of dto.items) {
            results.push(await this.service.setQuota(item));
        }
        return results;
    }
    findAll(year, quarter) {
        return this.service.findAll(year ? parseInt(year) : undefined, quarter);
    }
    getFarmerStatus(farmerId, year, quarter) {
        return this.service.getFarmerQuotaStatus(farmerId, parseInt(year), quarter);
    }
};
exports.QuotaController = QuotaController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '设置用水户季度亩均定额,调低时自动裁减超量申请' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SetQuotaDto]),
    __metadata("design:returntype", void 0)
], QuotaController.prototype, "setQuota", null);
__decorate([
    (0, common_1.Post)('batch'),
    (0, swagger_1.ApiOperation)({ summary: '批量设置用水户季度定额' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.BatchSetQuotaDto]),
    __metadata("design:returntype", Promise)
], QuotaController.prototype, "batchSet", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '查询所有定额配置' }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'quarter', required: false, enum: enums_1.QuotaQuarter }),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('quarter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], QuotaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('farmer/:farmerId/status'),
    (0, swagger_1.ApiOperation)({ summary: '查询用水户某季度定额状态(可用总量/已申请/剩余)' }),
    (0, swagger_1.ApiParam)({ name: 'farmerId' }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'quarter', required: true, enum: enums_1.QuotaQuarter }),
    __param(0, (0, common_1.Param)('farmerId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('quarter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], QuotaController.prototype, "getFarmerStatus", null);
exports.QuotaController = QuotaController = __decorate([
    (0, swagger_1.ApiTags)('定额管理'),
    (0, common_1.Controller)('quotas'),
    __metadata("design:paramtypes", [quota_service_1.QuotaService])
], QuotaController);
//# sourceMappingURL=quota.controller.js.map