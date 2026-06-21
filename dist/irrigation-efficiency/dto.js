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
exports.GetAssessmentDto = exports.TriggerAssessmentDto = exports.QueryFarmerEfficiencyHistoryDto = exports.UpdateChannelCoefficientDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const enums_1 = require("../common/enums");
class UpdateChannelCoefficientDto {
}
exports.UpdateChannelCoefficientDto = UpdateChannelCoefficientDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '渠道水利用系数(0~1)' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], UpdateChannelCoefficientDto.prototype, "coefficient", void 0);
class QueryFarmerEfficiencyHistoryDto {
}
exports.QueryFarmerEfficiencyHistoryDto = QueryFarmerEfficiencyHistoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用水户ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryFarmerEfficiencyHistoryDto.prototype, "farmerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '开始日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryFarmerEfficiencyHistoryDto.prototype, "dateFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '结束日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryFarmerEfficiencyHistoryDto.prototype, "dateTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '页码(从1开始)', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryFarmerEfficiencyHistoryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '每页条数', default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryFarmerEfficiencyHistoryDto.prototype, "pageSize", void 0);
class TriggerAssessmentDto {
}
exports.TriggerAssessmentDto = TriggerAssessmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '年份' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], TriggerAssessmentDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '季度', enum: enums_1.QuotaQuarter }),
    (0, class_validator_1.IsEnum)(enums_1.QuotaQuarter),
    __metadata("design:type", String)
], TriggerAssessmentDto.prototype, "quarter", void 0);
class GetAssessmentDto {
}
exports.GetAssessmentDto = GetAssessmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '年份' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], GetAssessmentDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '季度', enum: enums_1.QuotaQuarter }),
    (0, class_validator_1.IsEnum)(enums_1.QuotaQuarter),
    __metadata("design:type", String)
], GetAssessmentDto.prototype, "quarter", void 0);
//# sourceMappingURL=dto.js.map