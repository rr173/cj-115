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
exports.InspectionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const inspection_service_1 = require("./inspection.service");
const dto_1 = require("./dto");
const enums_1 = require("../common/enums");
let InspectionController = class InspectionController {
    constructor(service) {
        this.service = service;
    }
    createInspection(dto) {
        return this.service.createInspection(dto);
    }
    findInspections(channelId, startDate, endDate) {
        return this.service.findInspections(channelId, startDate, endDate);
    }
    getChannelInspectionHistory(channelId) {
        return this.service.getChannelInspectionHistory(channelId);
    }
    getInspectionStatistics(channelId, startDate, endDate) {
        return this.service.getInspectionStatistics(channelId, startDate, endDate);
    }
    getOverdueChannels() {
        return this.service.getOverdueChannels();
    }
    createMaintenanceOrder(dto) {
        return this.service.createMaintenanceOrder(dto);
    }
    findMaintenanceOrders(status, channelId) {
        return this.service.findMaintenanceOrders(status, channelId);
    }
    findOneMaintenanceOrder(id) {
        return this.service.findOneMaintenanceOrder(id);
    }
    approveMaintenanceOrder(id) {
        return this.service.approveMaintenanceOrder(id);
    }
    startMaintenanceOrder(id) {
        return this.service.startMaintenanceOrder(id);
    }
    acceptMaintenanceOrder(id) {
        return this.service.acceptMaintenanceOrder(id);
    }
    closeMaintenanceOrder(id) {
        return this.service.closeMaintenanceOrder(id);
    }
    getStopWaterSchedule(startDate, endDate) {
        return this.service.getStopWaterSchedule(startDate, endDate);
    }
    resetChannelInspectionStatus(channelId) {
        return this.service.resetChannelInspectionStatus(channelId);
    }
};
exports.InspectionController = InspectionController;
__decorate([
    (0, common_1.Post)('inspections'),
    (0, swagger_1.ApiOperation)({ summary: '提交巡检报告(紧急问题自动将渠道状态置为待维修)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateInspectionDto]),
    __metadata("design:returntype", void 0)
], InspectionController.prototype, "createInspection", null);
__decorate([
    (0, common_1.Get)('inspections'),
    (0, swagger_1.ApiOperation)({ summary: '查询巡检记录列表(可按渠道、日期范围筛选)' }),
    (0, swagger_1.ApiQuery)({ name: 'channelId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'YYYY-MM-DD' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'YYYY-MM-DD' }),
    __param(0, (0, common_1.Query)('channelId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], InspectionController.prototype, "findInspections", null);
__decorate([
    (0, common_1.Get)('inspections/channel/:channelId'),
    (0, swagger_1.ApiOperation)({ summary: '按渠道查询巡检历史' }),
    (0, swagger_1.ApiParam)({ name: 'channelId', description: '渠道ID' }),
    __param(0, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InspectionController.prototype, "getChannelInspectionHistory", null);
__decorate([
    (0, common_1.Get)('inspections/statistics'),
    (0, swagger_1.ApiOperation)({ summary: '按渠道和时间段统计各级别问题数量分布' }),
    (0, swagger_1.ApiQuery)({ name: 'channelId', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true, description: 'YYYY-MM-DD' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true, description: 'YYYY-MM-DD' }),
    __param(0, (0, common_1.Query)('channelId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], InspectionController.prototype, "getInspectionStatistics", null);
__decorate([
    (0, common_1.Get)('inspections/overdue'),
    (0, swagger_1.ApiOperation)({ summary: '查询超期未巡检的渠道列表(根据每条渠道的巡检周期判定)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InspectionController.prototype, "getOverdueChannels", null);
__decorate([
    (0, common_1.Post)('maintenance-orders'),
    (0, swagger_1.ApiOperation)({ summary: '创建维护工单(仅待维修渠道,自动检测停水窗口冲突)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateMaintenanceOrderDto]),
    __metadata("design:returntype", void 0)
], InspectionController.prototype, "createMaintenanceOrder", null);
__decorate([
    (0, common_1.Get)('maintenance-orders'),
    (0, swagger_1.ApiOperation)({ summary: '查询维护工单列表' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: enums_1.MaintenanceOrderStatus }),
    (0, swagger_1.ApiQuery)({ name: 'channelId', required: false }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InspectionController.prototype, "findMaintenanceOrders", null);
__decorate([
    (0, common_1.Get)('maintenance-orders/:id'),
    (0, swagger_1.ApiOperation)({ summary: '查询维护工单详情' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '工单ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InspectionController.prototype, "findOneMaintenanceOrder", null);
__decorate([
    (0, common_1.Put)('maintenance-orders/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: '审批维护工单(自动分析停水影响并取消受影响的配水申请)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '工单ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InspectionController.prototype, "approveMaintenanceOrder", null);
__decorate([
    (0, common_1.Put)('maintenance-orders/:id/start'),
    (0, swagger_1.ApiOperation)({ summary: '开始施工(渠道状态变更为维修中)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '工单ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InspectionController.prototype, "startMaintenanceOrder", null);
__decorate([
    (0, common_1.Put)('maintenance-orders/:id/accept'),
    (0, swagger_1.ApiOperation)({ summary: '验收工单' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '工单ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InspectionController.prototype, "acceptMaintenanceOrder", null);
__decorate([
    (0, common_1.Put)('maintenance-orders/:id/close'),
    (0, swagger_1.ApiOperation)({ summary: '关闭工单(无其他活跃工单时渠道状态变更为已完工)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '工单ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InspectionController.prototype, "closeMaintenanceOrder", null);
__decorate([
    (0, common_1.Get)('stop-water/schedule'),
    (0, swagger_1.ApiOperation)({ summary: '查询日期范围内所有计划停水的渠道列表和维护工单信息' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true, description: 'YYYY-MM-DD' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true, description: 'YYYY-MM-DD' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InspectionController.prototype, "getStopWaterSchedule", null);
__decorate([
    (0, common_1.Put)('channels/:channelId/inspection-status/reset'),
    (0, swagger_1.ApiOperation)({ summary: '将已完工渠道的巡检状态重置为正常' }),
    (0, swagger_1.ApiParam)({ name: 'channelId', description: '渠道ID' }),
    __param(0, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InspectionController.prototype, "resetChannelInspectionStatus", null);
exports.InspectionController = InspectionController = __decorate([
    (0, swagger_1.ApiTags)('渠道巡检与维护'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [inspection_service_1.InspectionService])
], InspectionController);
//# sourceMappingURL=inspection.controller.js.map