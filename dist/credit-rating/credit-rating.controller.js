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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditRatingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const credit_rating_service_1 = require("./credit-rating.service");
const dto_1 = require("./dto");
let CreditRatingController = class CreditRatingController {
    constructor(service) {
        this.service = service;
    }
    async getFarmerCredit(farmerId) {
        try {
            return await this.service.getFarmerCreditDetail(farmerId);
        }
        catch (e) {
            if (e.message === '用水户不存在')
                throw new common_1.NotFoundException(e.message);
            throw new common_1.BadRequestException(e.message);
        }
    }
    async getCreditRanking() {
        return this.service.getCreditRanking();
    }
    async adjustCreditScore(farmerId, dto) {
        try {
            return await this.service.adjustCreditScore(farmerId, dto);
        }
        catch (e) {
            if (e.message === '用水户不存在')
                throw new common_1.NotFoundException(e.message);
            throw new common_1.BadRequestException(e.message);
        }
    }
    async getCreditHistory(farmerId, page, pageSize) {
        const dto = {
            farmerId,
            page: page ? parseInt(page, 10) : undefined,
            pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
        };
        try {
            return await this.service.getCreditHistory(dto);
        }
        catch (e) {
            if (e.message === '用水户不存在')
                throw new common_1.NotFoundException(e.message);
            throw new common_1.BadRequestException(e.message);
        }
    }
    async triggerRecalculate() {
        return this.service.recalculateAll();
    }
};
exports.CreditRatingController = CreditRatingController;
__decorate([
    (0, common_1.Get)(':farmerId'),
    (0, swagger_1.ApiOperation)({ summary: '查询某用水户的当前信用分和等级及各因子明细' }),
    (0, swagger_1.ApiParam)({ name: 'farmerId', description: '用水户ID' }),
    __param(0, (0, common_1.Param)('farmerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CreditRatingController.prototype, "getFarmerCredit", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '查询所有用水户信用排行(按分数降序)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CreditRatingController.prototype, "getCreditRanking", null);
__decorate([
    (0, common_1.Post)(':farmerId/adjust'),
    (0, swagger_1.ApiOperation)({ summary: '手动调整某用水户信用分(管理员加减分并填原因,调整记录留痕)' }),
    (0, swagger_1.ApiParam)({ name: 'farmerId', description: '用水户ID' }),
    __param(0, (0, common_1.Param)('farmerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AdjustCreditScoreDto]),
    __metadata("design:returntype", Promise)
], CreditRatingController.prototype, "adjustCreditScore", null);
__decorate([
    (0, common_1.Get)(':farmerId/history'),
    (0, swagger_1.ApiOperation)({ summary: '查询某用水户的信用变动历史(每次重算和手动调整的记录)' }),
    (0, swagger_1.ApiParam)({ name: 'farmerId', description: '用水户ID' }),
    (0, swagger_1.ApiQuery)({ name: 'page', description: '页码(从1开始)', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', description: '每页条数', required: false, type: Number }),
    __param(0, (0, common_1.Param)('farmerId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CreditRatingController.prototype, "getCreditHistory", null);
__decorate([
    (0, common_1.Post)('recalculate'),
    (0, swagger_1.ApiOperation)({ summary: '触发全量信用重算(不等每月1号,手动跑一次)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CreditRatingController.prototype, "triggerRecalculate", null);
exports.CreditRatingController = CreditRatingController = __decorate([
    (0, swagger_1.ApiTags)('用水户信用评级'),
    (0, common_1.Controller)('credit-rating'),
    __metadata("design:paramtypes", [credit_rating_service_1.CreditRatingService])
], CreditRatingController);
//# sourceMappingURL=credit-rating.controller.js.map