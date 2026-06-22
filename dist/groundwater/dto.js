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
exports.UpdateElectricityQuotaDto = exports.CreateElectricityQuotaDto = exports.ResolveMeterAbnormalDto = exports.ReportMeterReadingDto = exports.UpdateCoefficientDto = exports.UpdateSmartMeterDto = exports.RegisterSmartMeterDto = exports.AddZoneChannelDto = exports.GenerateJointSupplyPlanDto = exports.UpdatePumpingWellDto = exports.CreatePumpingWellDto = exports.RecordWaterLevelDepthDto = exports.AdjustRedlineDto = exports.UpdateIrrigationZoneDto = exports.CreateIrrigationZoneDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateIrrigationZoneDto {
}
exports.CreateIrrigationZoneDto = CreateIrrigationZoneDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分区编号' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIrrigationZoneDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分区名称' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIrrigationZoneDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '年度地下水开采红线 m³' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateIrrigationZoneDto.prototype, "annualExtractionRedline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '当前地下水位埋深 m' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateIrrigationZoneDto.prototype, "currentWaterLevelDepth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '警戒埋深 m' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateIrrigationZoneDto.prototype, "warningDepth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '可采系数 m³/m（每降低1m水位可开采水量）', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateIrrigationZoneDto.prototype, "recoverableCoefficient", void 0);
class UpdateIrrigationZoneDto {
}
exports.UpdateIrrigationZoneDto = UpdateIrrigationZoneDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分区名称', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateIrrigationZoneDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '年度地下水开采红线 m³', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateIrrigationZoneDto.prototype, "annualExtractionRedline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '警戒埋深 m', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateIrrigationZoneDto.prototype, "warningDepth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '可采系数 m³/m', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateIrrigationZoneDto.prototype, "recoverableCoefficient", void 0);
class AdjustRedlineDto {
}
exports.AdjustRedlineDto = AdjustRedlineDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分区ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdjustRedlineDto.prototype, "zoneId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '新的年度开采红线 m³' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], AdjustRedlineDto.prototype, "newRedline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '调整原因', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdjustRedlineDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '操作人', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdjustRedlineDto.prototype, "operator", void 0);
class RecordWaterLevelDepthDto {
}
exports.RecordWaterLevelDepthDto = RecordWaterLevelDepthDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分区ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordWaterLevelDepthDto.prototype, "zoneId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '实测埋深 m' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], RecordWaterLevelDepthDto.prototype, "measuredDepth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '操作人', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordWaterLevelDepthDto.prototype, "operator", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordWaterLevelDepthDto.prototype, "remark", void 0);
class CreatePumpingWellDto {
}
exports.CreatePumpingWellDto = CreatePumpingWellDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '机井编号' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePumpingWellDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '所属灌溉分区ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePumpingWellDto.prototype, "zoneId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '额定出水流量 m³/h' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreatePumpingWellDto.prototype, "ratedFlow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '单位抽水成本 元/m³' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreatePumpingWellDto.prototype, "unitCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '关联的农渠ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePumpingWellDto.prototype, "associatedChannelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '关联服务的地块标识', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePumpingWellDto.prototype, "associatedPlot", void 0);
class UpdatePumpingWellDto {
}
exports.UpdatePumpingWellDto = UpdatePumpingWellDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '所属灌溉分区ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePumpingWellDto.prototype, "zoneId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '额定出水流量 m³/h', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdatePumpingWellDto.prototype, "ratedFlow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '单位抽水成本 元/m³', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdatePumpingWellDto.prototype, "unitCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '关联的农渠ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePumpingWellDto.prototype, "associatedChannelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '关联服务的地块标识', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePumpingWellDto.prototype, "associatedPlot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否启用', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePumpingWellDto.prototype, "isActive", void 0);
class GenerateJointSupplyPlanDto {
}
exports.GenerateJointSupplyPlanDto = GenerateJointSupplyPlanDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用水申请ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateJointSupplyPlanDto.prototype, "applicationId", void 0);
class AddZoneChannelDto {
}
exports.AddZoneChannelDto = AddZoneChannelDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '灌溉分区ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddZoneChannelDto.prototype, "zoneId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '渠道ID(农渠)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddZoneChannelDto.prototype, "channelId", void 0);
class RegisterSmartMeterDto {
}
exports.RegisterSmartMeterDto = RegisterSmartMeterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '机井ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterSmartMeterDto.prototype, "wellId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '智能电表表号' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterSmartMeterDto.prototype, "meterNo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '电表初始读数(度)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RegisterSmartMeterDto.prototype, "initialReading", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterSmartMeterDto.prototype, "remark", void 0);
class UpdateSmartMeterDto {
}
exports.UpdateSmartMeterDto = UpdateSmartMeterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '电表表号', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSmartMeterDto.prototype, "meterNo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '电表状态', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSmartMeterDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSmartMeterDto.prototype, "remark", void 0);
class UpdateCoefficientDto {
}
exports.UpdateCoefficientDto = UpdateCoefficientDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '机井ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCoefficientDto.prototype, "wellId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '以电折水系数(立方米/度)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateCoefficientDto.prototype, "coefficient", void 0);
class ReportMeterReadingDto {
}
exports.ReportMeterReadingDto = ReportMeterReadingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '电表表号' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReportMeterReadingDto.prototype, "meterNo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '本次上报读数(度)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], ReportMeterReadingDto.prototype, "reading", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '上报时间(默认当前)', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ReportMeterReadingDto.prototype, "reportedAt", void 0);
class ResolveMeterAbnormalDto {
}
exports.ResolveMeterAbnormalDto = ResolveMeterAbnormalDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '告警ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResolveMeterAbnormalDto.prototype, "alertId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '新的基准读数(度)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], ResolveMeterAbnormalDto.prototype, "newBaselineReading", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '处理人' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResolveMeterAbnormalDto.prototype, "operator", void 0);
class CreateElectricityQuotaDto {
}
exports.CreateElectricityQuotaDto = CreateElectricityQuotaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '灌溉分区ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateElectricityQuotaDto.prototype, "zoneId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '灌溉季名称,如"2026年春灌"' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateElectricityQuotaDto.prototype, "seasonName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '灌溉季开始日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateElectricityQuotaDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '灌溉季结束日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateElectricityQuotaDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '电量配额(总度数)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateElectricityQuotaDto.prototype, "totalKwh", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '操作人', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateElectricityQuotaDto.prototype, "operator", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateElectricityQuotaDto.prototype, "remark", void 0);
class UpdateElectricityQuotaDto {
}
exports.UpdateElectricityQuotaDto = UpdateElectricityQuotaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '新的电量配额(总度数)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateElectricityQuotaDto.prototype, "totalKwh", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateElectricityQuotaDto.prototype, "remark", void 0);
//# sourceMappingURL=dto.js.map