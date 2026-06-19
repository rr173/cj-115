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
exports.GetFarmerPaymentHistoryDto = exports.PayWaterBillDto = exports.ChannelBillSummaryDto = exports.GetFarmerBillDto = exports.GenerateBillsDto = exports.BindChannelPriceSchemeDto = exports.UpdateWaterPriceSchemeDto = exports.CreateWaterPriceSchemeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const enums_1 = require("../common/enums");
class CreateWaterPriceSchemeDto {
}
exports.CreateWaterPriceSchemeDto = CreateWaterPriceSchemeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '水价方案名称' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWaterPriceSchemeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '水价方案编码' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWaterPriceSchemeDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '基准水价 元/m³' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateWaterPriceSchemeDto.prototype, "basePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '第一档(定额内)价格倍数', default: 1.0, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateWaterPriceSchemeDto.prototype, "tier1Multiplier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '第二档阈值(超定额比例)', default: 1.3, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateWaterPriceSchemeDto.prototype, "tier2Threshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '第二档价格倍数', default: 1.5, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateWaterPriceSchemeDto.prototype, "tier2Multiplier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '第三档价格倍数', default: 2.0, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateWaterPriceSchemeDto.prototype, "tier3Multiplier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '方案描述', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWaterPriceSchemeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否启用', default: true, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateWaterPriceSchemeDto.prototype, "isActive", void 0);
class UpdateWaterPriceSchemeDto {
}
exports.UpdateWaterPriceSchemeDto = UpdateWaterPriceSchemeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '水价方案名称', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWaterPriceSchemeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '基准水价 元/m³', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateWaterPriceSchemeDto.prototype, "basePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '第一档价格倍数', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateWaterPriceSchemeDto.prototype, "tier1Multiplier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '第二档阈值', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateWaterPriceSchemeDto.prototype, "tier2Threshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '第二档价格倍数', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateWaterPriceSchemeDto.prototype, "tier2Multiplier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '第三档价格倍数', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateWaterPriceSchemeDto.prototype, "tier3Multiplier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '方案描述', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWaterPriceSchemeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否启用', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateWaterPriceSchemeDto.prototype, "isActive", void 0);
class BindChannelPriceSchemeDto {
}
exports.BindChannelPriceSchemeDto = BindChannelPriceSchemeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '渠道ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BindChannelPriceSchemeDto.prototype, "channelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '水价方案ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BindChannelPriceSchemeDto.prototype, "schemeId", void 0);
class GenerateBillsDto {
}
exports.GenerateBillsDto = GenerateBillsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '账单年份' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], GenerateBillsDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '账单月份 1-12' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], GenerateBillsDto.prototype, "month", void 0);
class GetFarmerBillDto {
}
exports.GetFarmerBillDto = GetFarmerBillDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用水户ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetFarmerBillDto.prototype, "farmerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '年份', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], GetFarmerBillDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '月份 1-12', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], GetFarmerBillDto.prototype, "month", void 0);
class ChannelBillSummaryDto {
}
exports.ChannelBillSummaryDto = ChannelBillSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '年份' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ChannelBillSummaryDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '月份 1-12' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], ChannelBillSummaryDto.prototype, "month", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '渠道ID,不传则汇总所有渠道', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChannelBillSummaryDto.prototype, "channelId", void 0);
class PayWaterBillDto {
}
exports.PayWaterBillDto = PayWaterBillDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '账单ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayWaterBillDto.prototype, "billId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '缴费金额', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], PayWaterBillDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '缴费方式 FULL全额/PARTIAL部分', enum: enums_1.PaymentMethod, default: enums_1.PaymentMethod.FULL }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.PaymentMethod),
    __metadata("design:type", String)
], PayWaterBillDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayWaterBillDto.prototype, "remark", void 0);
class GetFarmerPaymentHistoryDto {
}
exports.GetFarmerPaymentHistoryDto = GetFarmerPaymentHistoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用水户ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetFarmerPaymentHistoryDto.prototype, "farmerId", void 0);
//# sourceMappingURL=dto.js.map