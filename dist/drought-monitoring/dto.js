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
exports.QuerySupplyDemandTrendDto = exports.QueryChannelTransfersDto = exports.CreateChannelTransferDto = exports.QueryDroughtEventsDto = exports.ReportWaterSourceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const enums_1 = require("../common/enums");
class ReportWaterSourceDto {
}
exports.ReportWaterSourceDto = ReportWaterSourceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '干渠入口渠道ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReportWaterSourceDto.prototype, "channelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '当前实际来水流量(m³/s)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], ReportWaterSourceDto.prototype, "flow", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '上报时间(ISO8601),默认当前时间' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReportWaterSourceDto.prototype, "reportedAt", void 0);
class QueryDroughtEventsDto {
}
exports.QueryDroughtEventsDto = QueryDroughtEventsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: enums_1.DroughtStatus, description: '旱情等级筛选' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.DroughtStatus),
    __metadata("design:type", String)
], QueryDroughtEventsDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '开始时间' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryDroughtEventsDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '结束时间' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryDroughtEventsDto.prototype, "endTime", void 0);
class CreateChannelTransferDto {
}
exports.CreateChannelTransferDto = CreateChannelTransferDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '借出渠道ID(空闲渠道)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChannelTransferDto.prototype, "sourceChannelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '被借入渠道ID(缺水渠道)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChannelTransferDto.prototype, "targetChannelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '借调容量(m³/s)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateChannelTransferDto.prototype, "transferredCapacity", void 0);
class QueryChannelTransfersDto {
}
exports.QueryChannelTransfersDto = QueryChannelTransfersDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: enums_1.ChannelTransferStatus, description: '借调状态筛选' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.ChannelTransferStatus),
    __metadata("design:type", String)
], QueryChannelTransfersDto.prototype, "status", void 0);
class QuerySupplyDemandTrendDto {
}
exports.QuerySupplyDemandTrendDto = QuerySupplyDemandTrendDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '开始时间' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QuerySupplyDemandTrendDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '结束时间' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QuerySupplyDemandTrendDto.prototype, "endTime", void 0);
//# sourceMappingURL=dto.js.map