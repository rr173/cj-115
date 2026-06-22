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
exports.EmergencyApplicationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const emergency_application_service_1 = require("./emergency-application.service");
const dto_1 = require("./dto");
const enums_1 = require("../common/enums");
let EmergencyApplicationController = class EmergencyApplicationController {
    constructor(service) {
        this.service = service;
    }
    async findAll(status, farmerId, page, pageSize) {
        const dto = {
            status,
            farmerId,
            page: page ? parseInt(page, 10) : undefined,
            pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
        };
        return this.service.findAll(dto);
    }
    async getStatistics(year, month) {
        const dto = {
            year: parseInt(year, 10),
            month: parseInt(month, 10),
        };
        try {
            return await this.service.getMonthlyStatistics(dto);
        }
        catch (e) {
            throw new common_1.BadRequestException(e.message);
        }
    }
    async findOne(id) {
        try {
            return await this.service.findOne(id);
        }
        catch (e) {
            if (e.message === '申请不存在')
                throw new common_1.NotFoundException(e.message);
            throw new common_1.BadRequestException(e.message);
        }
    }
    async approve(id, dto) {
        try {
            return await this.service.approve(id, dto);
        }
        catch (e) {
            if (e.message === '申请不存在')
                throw new common_1.NotFoundException(e.message);
            throw new common_1.BadRequestException(e.message);
        }
    }
};
exports.EmergencyApplicationController = EmergencyApplicationController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '查询紧急申请列表(按状态筛选)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: enums_1.EmergencyApprovalStatus, description: '审批状态 PENDING_APPROVAL-待审批 APPROVED-已批准 REJECTED-已驳回 TO_BE_TRACED-待追溯' }),
    (0, swagger_1.ApiQuery)({ name: 'farmerId', required: false, description: '用水户ID' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: '页码(从1开始)' }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, description: '每页条数' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('farmerId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], EmergencyApplicationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, swagger_1.ApiOperation)({ summary: '按月统计紧急申请使用情况' }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: true, description: '年份' }),
    (0, swagger_1.ApiQuery)({ name: 'month', required: true, description: '月份(1-12)' }),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmergencyApplicationController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '查询紧急申请详情' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '申请ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmergencyApplicationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, swagger_1.ApiOperation)({ summary: '审批紧急申请(批准或驳回)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '申请ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.EmergencyApprovalDto]),
    __metadata("design:returntype", Promise)
], EmergencyApplicationController.prototype, "approve", null);
exports.EmergencyApplicationController = EmergencyApplicationController = __decorate([
    (0, swagger_1.ApiTags)('紧急用水申请'),
    (0, common_1.Controller)('emergency-applications'),
    __metadata("design:paramtypes", [emergency_application_service_1.EmergencyApplicationService])
], EmergencyApplicationController);
//# sourceMappingURL=emergency-application.controller.js.map