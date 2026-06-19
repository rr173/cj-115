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
exports.UpdateIrrigationRoundDto = exports.CreateIrrigationRoundDto = exports.CreateIrrigationSeasonDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateIrrigationSeasonDto {
}
exports.CreateIrrigationSeasonDto = CreateIrrigationSeasonDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '灌溉季名称,如"2026夏灌"' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIrrigationSeasonDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '开始日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateIrrigationSeasonDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '结束日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateIrrigationSeasonDto.prototype, "endDate", void 0);
class CreateIrrigationRoundDto {
}
exports.CreateIrrigationRoundDto = CreateIrrigationRoundDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '所属灌溉季ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIrrigationRoundDto.prototype, "seasonId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '轮次名称,如"第一轮-东片区"' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIrrigationRoundDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '开始日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateIrrigationRoundDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '结束日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateIrrigationRoundDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '总供水量上限(m³)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateIrrigationRoundDto.prototype, "waterLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '参与渠道ID列表(选某条渠道则包含其所有子渠道)' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateIrrigationRoundDto.prototype, "channelIds", void 0);
class UpdateIrrigationRoundDto {
}
exports.UpdateIrrigationRoundDto = UpdateIrrigationRoundDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '轮次名称' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateIrrigationRoundDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '开始日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateIrrigationRoundDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '结束日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateIrrigationRoundDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '总供水量上限(m³)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateIrrigationRoundDto.prototype, "waterLimit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '参与渠道ID列表' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateIrrigationRoundDto.prototype, "channelIds", void 0);
//# sourceMappingURL=dto.js.map