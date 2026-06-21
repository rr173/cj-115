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
exports.QueryAlertsDto = exports.QueryReadingsDto = exports.SwitchGateModeDto = exports.ManualGateOpeningDto = exports.CreateGateDto = exports.ReportReadingsDto = exports.WaterLevelReadingItemDto = exports.CreateMonitorDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const enums_1 = require("../common/enums");
class CreateMonitorDto {
}
exports.CreateMonitorDto = CreateMonitorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '监测点编号' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMonitorDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '所属渠道ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMonitorDto.prototype, "channelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '安装位置(距渠首多少米)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateMonitorDto.prototype, "installPosition", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '正常水位下限(m)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMonitorDto.prototype, "normalLower", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '正常水位上限(m)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMonitorDto.prototype, "normalUpper", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '超上限多少触发告警(m)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateMonitorDto.prototype, "alertOverUpper", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '低于下限多少触发告警(m)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateMonitorDto.prototype, "alertBelowLower", void 0);
class WaterLevelReadingItemDto {
}
exports.WaterLevelReadingItemDto = WaterLevelReadingItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '监测点ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WaterLevelReadingItemDto.prototype, "monitorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '水位值(m)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WaterLevelReadingItemDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '采集时间戳' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], WaterLevelReadingItemDto.prototype, "timestamp", void 0);
class ReportReadingsDto {
}
exports.ReportReadingsDto = ReportReadingsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '水位读数列表', type: [WaterLevelReadingItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WaterLevelReadingItemDto),
    __metadata("design:type", Array)
], ReportReadingsDto.prototype, "readings", void 0);
class CreateGateDto {
}
exports.CreateGateDto = CreateGateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '闸门编号' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGateDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '所属渠道ID(渠道起点进水闸)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGateDto.prototype, "channelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '最大开度(%)', default: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateGateDto.prototype, "maxOpening", void 0);
class ManualGateOpeningDto {
}
exports.ManualGateOpeningDto = ManualGateOpeningDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '目标开度(%)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ManualGateOpeningDto.prototype, "targetOpening", void 0);
class SwitchGateModeDto {
}
exports.SwitchGateModeDto = SwitchGateModeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.GateControlMode, description: '控制模式: AUTO自动/MANUAL手动' }),
    (0, class_validator_1.IsEnum)(enums_1.GateControlMode),
    __metadata("design:type", String)
], SwitchGateModeDto.prototype, "controlMode", void 0);
class QueryReadingsDto {
}
exports.QueryReadingsDto = QueryReadingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '开始时间' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryReadingsDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '结束时间' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryReadingsDto.prototype, "endTime", void 0);
class QueryAlertsDto {
}
exports.QueryAlertsDto = QueryAlertsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: enums_1.WaterLevelAlertType, description: '告警类型筛选' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.WaterLevelAlertType),
    __metadata("design:type", String)
], QueryAlertsDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '渠道ID筛选' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAlertsDto.prototype, "channelId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '是否只查未解决' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QueryAlertsDto.prototype, "unresolvedOnly", void 0);
//# sourceMappingURL=dto.js.map