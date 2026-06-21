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
exports.GetCreditHistoryDto = exports.AdjustCreditScoreDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class AdjustCreditScoreDto {
}
exports.AdjustCreditScoreDto = AdjustCreditScoreDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '调整分值(正数加分,负数减分)' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], AdjustCreditScoreDto.prototype, "adjustScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '调整原因' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdjustCreditScoreDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '操作人', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdjustCreditScoreDto.prototype, "operator", void 0);
class GetCreditHistoryDto {
}
exports.GetCreditHistoryDto = GetCreditHistoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用水户ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetCreditHistoryDto.prototype, "farmerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '页码(从1开始)', default: 1, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetCreditHistoryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '每页条数', default: 20, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], GetCreditHistoryDto.prototype, "pageSize", void 0);
//# sourceMappingURL=dto.js.map