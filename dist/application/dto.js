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
exports.ListApplicationsDto = exports.CreateApplicationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const enums_1 = require("../common/enums");
class CreateApplicationDto {
}
exports.CreateApplicationDto = CreateApplicationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用水户ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "farmerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '期望流量 m³/s' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateApplicationDto.prototype, "expectedFlow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '期望时长 小时' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateApplicationDto.prototype, "expectedHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '期望配水日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "targetDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否为紧急申请', required: false, default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateApplicationDto.prototype, "isEmergency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '紧急原因 DROUGHT-作物旱情 FIRE_PREVENTION-防火需要 EQUIPMENT_FLUSH-设备冲洗 OTHER-其他', required: false, enum: enums_1.EmergencyReason }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.EmergencyReason),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "emergencyReason", void 0);
class ListApplicationsDto {
}
exports.ListApplicationsDto = ListApplicationsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用水户ID', required: false }),
    __metadata("design:type", String)
], ListApplicationsDto.prototype, "farmerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '配水日期 YYYY-MM-DD', required: false }),
    __metadata("design:type", String)
], ListApplicationsDto.prototype, "targetDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '状态 PENDING/SCHEDULED/FAILED/CANCELLED_QUOTA/EXECUTED', required: false }),
    __metadata("design:type", String)
], ListApplicationsDto.prototype, "status", void 0);
//# sourceMappingURL=dto.js.map