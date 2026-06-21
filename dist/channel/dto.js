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
exports.UpdateChannelDto = exports.CreateChannelDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const enums_1 = require("../common/enums");
class CreateChannelDto {
}
exports.CreateChannelDto = CreateChannelDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '渠道编号' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChannelDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '渠道名称' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChannelDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.ChannelLevel, description: '渠道级别: MAIN干渠, BRANCH支渠, LATERAL斗渠, FARM农渠' }),
    (0, class_validator_1.IsEnum)(enums_1.ChannelLevel),
    __metadata("design:type", String)
], CreateChannelDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '设计最大流量 m³/s' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateChannelDto.prototype, "maxFlow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '长度 m' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateChannelDto.prototype, "length", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '上级渠道ID,干渠为空' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChannelDto.prototype, "parentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '渠道水利用系数(0~1),默认0.95', default: 0.95 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], CreateChannelDto.prototype, "waterUtilizationCoefficient", void 0);
class UpdateChannelDto {
}
exports.UpdateChannelDto = UpdateChannelDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '渠道名称' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateChannelDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '设计最大流量 m³/s' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateChannelDto.prototype, "maxFlow", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '长度 m' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateChannelDto.prototype, "length", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '渠道水利用系数(0~1)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], UpdateChannelDto.prototype, "waterUtilizationCoefficient", void 0);
//# sourceMappingURL=dto.js.map