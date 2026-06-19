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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWaterRightsAccountDto = exports.GetTradeHistoryDto = exports.GetMarketSellOrdersDto = exports.CancelSellOrderDto = exports.BuySellOrderDto = exports.CreateSellOrderDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const enums_1 = require("../common/enums");
class CreateSellOrderDto {
}
exports.CreateSellOrderDto = CreateSellOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '卖方用水户ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSellOrderDto.prototype, "sellerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '年份' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2000),
    __metadata("design:type", Number)
], CreateSellOrderDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.QuotaQuarter, description: '季度 Q1-Q4' }),
    (0, class_validator_1.IsEnum)(enums_1.QuotaQuarter),
    __metadata("design:type", String)
], CreateSellOrderDto.prototype, "quarter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '出售量 m³' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateSellOrderDto.prototype, "sellVolume", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '单价 元/m³' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateSellOrderDto.prototype, "unitPrice", void 0);
class BuySellOrderDto {
}
exports.BuySellOrderDto = BuySellOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '卖单ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BuySellOrderDto.prototype, "sellOrderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '买方用水户ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BuySellOrderDto.prototype, "buyerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '购买量 m³' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], BuySellOrderDto.prototype, "buyVolume", void 0);
class CancelSellOrderDto {
}
exports.CancelSellOrderDto = CancelSellOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '卖单ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CancelSellOrderDto.prototype, "sellOrderId", void 0);
class GetMarketSellOrdersDto {
}
exports.GetMarketSellOrdersDto = GetMarketSellOrdersDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '年份', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], GetMarketSellOrdersDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '季度', required: false, enum: enums_1.QuotaQuarter }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.QuotaQuarter),
    __metadata("design:type", String)
], GetMarketSellOrdersDto.prototype, "quarter", void 0);
class GetTradeHistoryDto {
}
exports.GetTradeHistoryDto = GetTradeHistoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用水户ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetTradeHistoryDto.prototype, "farmerId", void 0);
class GetWaterRightsAccountDto {
}
exports.GetWaterRightsAccountDto = GetWaterRightsAccountDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用水户ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetWaterRightsAccountDto.prototype, "farmerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '年份' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2000),
    __metadata("design:type", Number)
], GetWaterRightsAccountDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.QuotaQuarter, description: '季度 Q1-Q4' }),
    (0, class_validator_1.IsEnum)(enums_1.QuotaQuarter),
    __metadata("design:type", String)
], GetWaterRightsAccountDto.prototype, "quarter", void 0);
//# sourceMappingURL=dto.js.map