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
exports.UpdateFarmerDto = exports.CreateFarmerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateFarmerDto {
}
exports.CreateFarmerDto = CreateFarmerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用水户编号' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFarmerDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用水户名称' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFarmerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '关联末级农渠ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFarmerDto.prototype, "channelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '灌溉面积(亩)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateFarmerDto.prototype, "area", void 0);
class UpdateFarmerDto {
}
exports.UpdateFarmerDto = UpdateFarmerDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '用水户名称' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFarmerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '灌溉面积(亩)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateFarmerDto.prototype, "area", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '关联末级农渠ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFarmerDto.prototype, "channelId", void 0);
//# sourceMappingURL=dto.js.map