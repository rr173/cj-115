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
exports.EmergencyStatisticsDto = exports.ListEmergencyApplicationsDto = exports.EmergencyApprovalDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const enums_1 = require("../common/enums");
class EmergencyApprovalDto {
}
exports.EmergencyApprovalDto = EmergencyApprovalDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '审批结果 APPROVED-批准 REJECTED-驳回', enum: ['APPROVED', 'REJECTED'] }),
    (0, class_validator_1.IsEnum)(['APPROVED', 'REJECTED']),
    __metadata("design:type", String)
], EmergencyApprovalDto.prototype, "result", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '驳回原因(驳回时必填)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmergencyApprovalDto.prototype, "rejectReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '操作人', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmergencyApprovalDto.prototype, "operator", void 0);
class ListEmergencyApplicationsDto {
}
exports.ListEmergencyApplicationsDto = ListEmergencyApplicationsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '审批状态 PENDING_APPROVAL-待审批 APPROVED-已批准 REJECTED-已驳回 TO_BE_TRACED-待追溯', required: false, enum: enums_1.EmergencyApprovalStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.EmergencyApprovalStatus),
    __metadata("design:type", String)
], ListEmergencyApplicationsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用水户ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListEmergencyApplicationsDto.prototype, "farmerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '页码(从1开始)', default: 1, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ListEmergencyApplicationsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '每页条数', default: 20, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ListEmergencyApplicationsDto.prototype, "pageSize", void 0);
class EmergencyStatisticsDto {
}
exports.EmergencyStatisticsDto = EmergencyStatisticsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '年份', required: true }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], EmergencyStatisticsDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '月份(1-12)', required: true }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], EmergencyStatisticsDto.prototype, "month", void 0);
//# sourceMappingURL=dto.js.map