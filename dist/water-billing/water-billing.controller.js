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
exports.WaterBillingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const water_billing_service_1 = require("./water-billing.service");
const dto_1 = require("./dto");
let WaterBillingController = class WaterBillingController {
    constructor(service) {
        this.service = service;
    }
    createScheme(dto) {
        return this.service.createScheme(dto);
    }
    updateScheme(id, dto) {
        return this.service.updateScheme(id, dto);
    }
    listSchemes() {
        return this.service.listSchemes();
    }
    getScheme(id) {
        return this.service.getScheme(id);
    }
    deleteScheme(id) {
        return this.service.deleteScheme(id);
    }
    bindChannelPriceScheme(dto) {
        return this.service.bindChannelPriceScheme(dto);
    }
    unbindChannelPriceScheme(channelId) {
        return this.service.unbindChannelPriceScheme(channelId);
    }
    findApplicableSchemeForFarmer(farmerId) {
        return this.service.findApplicableSchemeForFarmer(farmerId);
    }
    generateMonthlyBills(dto) {
        return this.service.generateMonthlyBills(dto);
    }
    getFarmerBills(dto) {
        return this.service.getFarmerBills(dto);
    }
    getBillDetail(billId) {
        return this.service.getBillDetail(billId);
    }
    getChannelBillSummary(dto) {
        return this.service.getChannelBillSummary(dto);
    }
    payWaterBill(dto) {
        return this.service.payWaterBill(dto);
    }
    getFarmerPaymentHistory(dto) {
        return this.service.getFarmerPaymentHistory(dto);
    }
    getFarmerDebtStatus(farmerId) {
        return this.service.getFarmerDebtStatus(farmerId);
    }
    checkFarmerCanApply(farmerId) {
        return this.service.checkFarmerCanApply(farmerId);
    }
};
exports.WaterBillingController = WaterBillingController;
__decorate([
    (0, common_1.Post)('scheme'),
    (0, swagger_1.ApiOperation)({ summary: '创建水价方案' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateWaterPriceSchemeDto]),
    __metadata("design:returntype", void 0)
], WaterBillingController.prototype, "createScheme", null);
__decorate([
    (0, common_1.Put)('scheme/:id'),
    (0, swagger_1.ApiOperation)({ summary: '更新水价方案' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '水价方案ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateWaterPriceSchemeDto]),
    __metadata("design:returntype", void 0)
], WaterBillingController.prototype, "updateScheme", null);
__decorate([
    (0, common_1.Get)('schemes'),
    (0, swagger_1.ApiOperation)({ summary: '获取所有水价方案列表' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WaterBillingController.prototype, "listSchemes", null);
__decorate([
    (0, common_1.Get)('scheme/:id'),
    (0, swagger_1.ApiOperation)({ summary: '获取水价方案详情' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '水价方案ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WaterBillingController.prototype, "getScheme", null);
__decorate([
    (0, common_1.Delete)('scheme/:id'),
    (0, swagger_1.ApiOperation)({ summary: '删除水价方案' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '水价方案ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WaterBillingController.prototype, "deleteScheme", null);
__decorate([
    (0, common_1.Post)('bind-scheme'),
    (0, swagger_1.ApiOperation)({ summary: '渠道绑定水价方案' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.BindChannelPriceSchemeDto]),
    __metadata("design:returntype", void 0)
], WaterBillingController.prototype, "bindChannelPriceScheme", null);
__decorate([
    (0, common_1.Delete)('unbind-scheme/:channelId'),
    (0, swagger_1.ApiOperation)({ summary: '渠道解绑水价方案' }),
    (0, swagger_1.ApiParam)({ name: 'channelId', description: '渠道ID' }),
    __param(0, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WaterBillingController.prototype, "unbindChannelPriceScheme", null);
__decorate([
    (0, common_1.Get)('farmer-scheme/:farmerId'),
    (0, swagger_1.ApiOperation)({ summary: '查询用水户适用的水价方案(从农渠向上回溯)' }),
    (0, swagger_1.ApiParam)({ name: 'farmerId', description: '用水户ID' }),
    __param(0, (0, common_1.Param)('farmerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WaterBillingController.prototype, "findApplicableSchemeForFarmer", null);
__decorate([
    (0, common_1.Post)('generate-bills'),
    (0, swagger_1.ApiOperation)({ summary: '手动生成指定月份所有用水户的水费账单(每月1日系统自动执行)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GenerateBillsDto]),
    __metadata("design:returntype", void 0)
], WaterBillingController.prototype, "generateMonthlyBills", null);
__decorate([
    (0, common_1.Get)('farmer-bills'),
    (0, swagger_1.ApiOperation)({ summary: '按月查询某个用水户的账单详情列表' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetFarmerBillDto]),
    __metadata("design:returntype", void 0)
], WaterBillingController.prototype, "getFarmerBills", null);
__decorate([
    (0, common_1.Get)('bill/:billId'),
    (0, swagger_1.ApiOperation)({ summary: '获取单个账单详情(含阶梯明细、补贴、缴费记录)' }),
    (0, swagger_1.ApiParam)({ name: 'billId', description: '账单ID' }),
    __param(0, (0, common_1.Param)('billId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WaterBillingController.prototype, "getBillDetail", null);
__decorate([
    (0, common_1.Get)('channel-summary'),
    (0, swagger_1.ApiOperation)({ summary: '按渠道汇总当月应收水费' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ChannelBillSummaryDto]),
    __metadata("design:returntype", void 0)
], WaterBillingController.prototype, "getChannelBillSummary", null);
__decorate([
    (0, common_1.Post)('pay'),
    (0, swagger_1.ApiOperation)({ summary: '缴纳水费(支持全额和部分缴纳)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.PayWaterBillDto]),
    __metadata("design:returntype", void 0)
], WaterBillingController.prototype, "payWaterBill", null);
__decorate([
    (0, common_1.Get)('payment-history'),
    (0, swagger_1.ApiOperation)({ summary: '查询用水户历史缴费记录' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetFarmerPaymentHistoryDto]),
    __metadata("design:returntype", void 0)
], WaterBillingController.prototype, "getFarmerPaymentHistory", null);
__decorate([
    (0, common_1.Get)('debt-status/:farmerId'),
    (0, swagger_1.ApiOperation)({ summary: '查询用水户当前欠费状态(含冻结状态)' }),
    (0, swagger_1.ApiParam)({ name: 'farmerId', description: '用水户ID' }),
    __param(0, (0, common_1.Param)('farmerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WaterBillingController.prototype, "getFarmerDebtStatus", null);
__decorate([
    (0, common_1.Get)('can-apply/:farmerId'),
    (0, swagger_1.ApiOperation)({ summary: '检查用水户是否可提交新申请(欠费超过2个月冻结)' }),
    (0, swagger_1.ApiParam)({ name: 'farmerId', description: '用水户ID' }),
    __param(0, (0, common_1.Param)('farmerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WaterBillingController.prototype, "checkFarmerCanApply", null);
exports.WaterBillingController = WaterBillingController = __decorate([
    (0, swagger_1.ApiTags)('水费计量与阶梯水价结算'),
    (0, common_1.Controller)('water-billing'),
    __metadata("design:paramtypes", [water_billing_service_1.WaterBillingService])
], WaterBillingController);
//# sourceMappingURL=water-billing.controller.js.map