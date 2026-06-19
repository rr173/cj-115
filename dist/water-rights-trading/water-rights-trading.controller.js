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
exports.WaterRightsTradingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const water_rights_trading_service_1 = require("./water-rights-trading.service");
const dto_1 = require("./dto");
const enums_1 = require("../common/enums");
let WaterRightsTradingController = class WaterRightsTradingController {
    constructor(service) {
        this.service = service;
    }
    createSellOrder(dto) {
        return this.service.createSellOrder(dto);
    }
    buySellOrder(dto) {
        return this.service.buySellOrder(dto);
    }
    cancelSellOrder(sellOrderId) {
        return this.service.cancelSellOrder(sellOrderId);
    }
    getMarketSellOrders(dto) {
        return this.service.getMarketSellOrders(dto);
    }
    getTradeHistory(dto) {
        return this.service.getTradeHistory(dto);
    }
    getWaterRightsAccount(dto) {
        return this.service.getWaterRightsAccountDetail(dto);
    }
    expireOldOrders() {
        return this.service.expireOldOrders();
    }
};
exports.WaterRightsTradingController = WaterRightsTradingController;
__decorate([
    (0, common_1.Post)('sell-order'),
    (0, swagger_1.ApiOperation)({ summary: '挂牌出售水权额度(冻结出售量,7天有效期)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateSellOrderDto]),
    __metadata("design:returntype", void 0)
], WaterRightsTradingController.prototype, "createSellOrder", null);
__decorate([
    (0, common_1.Post)('buy'),
    (0, swagger_1.ApiOperation)({ summary: '购买已挂牌的卖单(支持部分购买,余额不足时拒绝)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.BuySellOrderDto]),
    __metadata("design:returntype", void 0)
], WaterRightsTradingController.prototype, "buySellOrder", null);
__decorate([
    (0, common_1.Delete)('sell-order/:sellOrderId'),
    (0, swagger_1.ApiOperation)({ summary: '撤单(解冻剩余量归还)' }),
    (0, swagger_1.ApiParam)({ name: 'sellOrderId', description: '卖单ID' }),
    __param(0, (0, common_1.Param)('sellOrderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WaterRightsTradingController.prototype, "cancelSellOrder", null);
__decorate([
    (0, common_1.Get)('market'),
    (0, swagger_1.ApiOperation)({ summary: '查询当前市场所有有效卖单(按单价升序)' }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'quarter', required: false, enum: enums_1.QuotaQuarter }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetMarketSellOrdersDto]),
    __metadata("design:returntype", void 0)
], WaterRightsTradingController.prototype, "getMarketSellOrders", null);
__decorate([
    (0, common_1.Get)('trade-history'),
    (0, swagger_1.ApiOperation)({ summary: '查询某用水户的交易历史(买入和卖出)' }),
    (0, swagger_1.ApiQuery)({ name: 'farmerId', required: true }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetTradeHistoryDto]),
    __metadata("design:returntype", void 0)
], WaterRightsTradingController.prototype, "getTradeHistory", null);
__decorate([
    (0, common_1.Get)('account'),
    (0, swagger_1.ApiOperation)({ summary: '查询某用水户的水权账户明细(初始额度/买入/卖出/已用/冻结/可用)' }),
    (0, swagger_1.ApiQuery)({ name: 'farmerId', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'quarter', required: true, enum: enums_1.QuotaQuarter }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetWaterRightsAccountDto]),
    __metadata("design:returntype", void 0)
], WaterRightsTradingController.prototype, "getWaterRightsAccount", null);
__decorate([
    (0, common_1.Post)('expire'),
    (0, swagger_1.ApiOperation)({ summary: '手动触发过期卖单处理(将超7天未成交的卖单作废,冻结量归还)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WaterRightsTradingController.prototype, "expireOldOrders", null);
exports.WaterRightsTradingController = WaterRightsTradingController = __decorate([
    (0, swagger_1.ApiTags)('水权交易'),
    (0, common_1.Controller)('water-rights-trading'),
    __metadata("design:paramtypes", [water_rights_trading_service_1.WaterRightsTradingService])
], WaterRightsTradingController);
//# sourceMappingURL=water-rights-trading.controller.js.map