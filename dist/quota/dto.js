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
exports.BatchSetQuotaDto = exports.SetQuotaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const enums_1 = require("../common/enums");
class SetQuotaDto {
}
exports.SetQuotaDto = SetQuotaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用水户ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SetQuotaDto.prototype, "farmerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.QuotaQuarter, description: '季度 Q1-Q4' }),
    (0, class_validator_1.IsEnum)(enums_1.QuotaQuarter),
    __metadata("design:type", String)
], SetQuotaDto.prototype, "quarter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '年份' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2000),
    __metadata("design:type", Number)
], SetQuotaDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '亩均定额 m³/亩' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], SetQuotaDto.prototype, "amount", void 0);
class BatchSetQuotaDto {
}
exports.BatchSetQuotaDto = BatchSetQuotaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SetQuotaDto], description: '批量设置定额' }),
    __metadata("design:type", Array)
], BatchSetQuotaDto.prototype, "items", void 0);
//# sourceMappingURL=dto.js.map