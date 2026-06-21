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
exports.QuarterlyStatsDto = exports.QueryDisputesDto = exports.CloseDisputeDto = exports.AddMediationRecordDto = exports.AcceptDisputeDto = exports.CreateDisputeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const enums_1 = require("../common/enums");
class CreateDisputeDto {
}
exports.CreateDisputeDto = CreateDisputeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '纠纷类型', enum: enums_1.DisputeType }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '涉及的用水户ID列表(至少2个)', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(2),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateDisputeDto.prototype, "farmerIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '纠纷描述' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '发生日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "occurredAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '关联的配水申请ID列表(可选)', type: [String], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateDisputeDto.prototype, "applicationIds", void 0);
class AcceptDisputeDto {
}
exports.AcceptDisputeDto = AcceptDisputeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '调解员姓名' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AcceptDisputeDto.prototype, "mediatorName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '预计处理天数' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AcceptDisputeDto.prototype, "expectedDays", void 0);
class AddMediationRecordDto {
}
exports.AddMediationRecordDto = AddMediationRecordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '记录人' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddMediationRecordDto.prototype, "recorderName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '内容描述' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddMediationRecordDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否涉及现场勘查', default: false, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AddMediationRecordDto.prototype, "isOnSiteInspection", void 0);
class CloseDisputeDto {
}
exports.CloseDisputeDto = CloseDisputeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '处理结论', enum: enums_1.MediationResult }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CloseDisputeDto.prototype, "result", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '结论说明' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CloseDisputeDto.prototype, "resultNote", void 0);
class QueryDisputesDto {
}
exports.QueryDisputesDto = QueryDisputesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '开始日期 YYYY-MM-DD', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryDisputesDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '结束日期 YYYY-MM-DD', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryDisputesDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '纠纷类型筛选', enum: enums_1.DisputeType, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryDisputesDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '状态筛选', enum: enums_1.DisputeStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryDisputesDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否超期筛选', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QueryDisputesDto.prototype, "isOverdue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '页码(从1开始)', default: 1, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryDisputesDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '每页条数', default: 20, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryDisputesDto.prototype, "pageSize", void 0);
class QuarterlyStatsDto {
}
exports.QuarterlyStatsDto = QuarterlyStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '年份' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], QuarterlyStatsDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '季度(Q1/Q2/Q3/Q4)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuarterlyStatsDto.prototype, "quarter", void 0);
//# sourceMappingURL=dto.js.map