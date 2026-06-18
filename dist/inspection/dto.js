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
exports.StopWaterQueryDto = exports.InspectionStatisticsDto = exports.ListInspectionsDto = exports.CreateMaintenanceOrderDto = exports.CreateInspectionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const enums_1 = require("../common/enums");
class CreateInspectionDto {
}
exports.CreateInspectionDto = CreateInspectionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '巡检渠道ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInspectionDto.prototype, "channelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '巡检员姓名' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInspectionDto.prototype, "inspectorName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '巡检日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateInspectionDto.prototype, "inspectionDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '发现问题描述' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInspectionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.ProblemLevel, description: '问题等级: MINOR一般, SEVERE严重, URGENT紧急' }),
    (0, class_validator_1.IsEnum)(enums_1.ProblemLevel),
    __metadata("design:type", String)
], CreateInspectionDto.prototype, "problemLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '渗漏率实测值' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateInspectionDto.prototype, "leakageRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '淤积深度(cm)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateInspectionDto.prototype, "siltDepth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '衬砌破损长度(m)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateInspectionDto.prototype, "liningDamageLength", void 0);
class CreateMaintenanceOrderDto {
}
exports.CreateMaintenanceOrderDto = CreateMaintenanceOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '渠道ID(须为待维修状态)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaintenanceOrderDto.prototype, "channelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '计划施工开始日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateMaintenanceOrderDto.prototype, "planStartDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '预计工期(天)' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateMaintenanceOrderDto.prototype, "estimatedDurationDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '施工队编号' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaintenanceOrderDto.prototype, "crewCode", void 0);
class ListInspectionsDto {
}
exports.ListInspectionsDto = ListInspectionsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '渠道ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListInspectionsDto.prototype, "channelId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '开始日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ListInspectionsDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '结束日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ListInspectionsDto.prototype, "endDate", void 0);
class InspectionStatisticsDto {
}
exports.InspectionStatisticsDto = InspectionStatisticsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '渠道ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InspectionStatisticsDto.prototype, "channelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '开始日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], InspectionStatisticsDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '结束日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], InspectionStatisticsDto.prototype, "endDate", void 0);
class StopWaterQueryDto {
}
exports.StopWaterQueryDto = StopWaterQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '查询开始日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], StopWaterQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '查询结束日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], StopWaterQueryDto.prototype, "endDate", void 0);
//# sourceMappingURL=dto.js.map