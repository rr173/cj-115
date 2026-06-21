"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DroughtMonitoringModule = void 0;
const common_1 = require("@nestjs/common");
const drought_monitoring_controller_1 = require("./drought-monitoring.controller");
const drought_monitoring_service_1 = require("./drought-monitoring.service");
const prisma_service_1 = require("../prisma/prisma.service");
const credit_rating_module_1 = require("../credit-rating/credit-rating.module");
let DroughtMonitoringModule = class DroughtMonitoringModule {
};
exports.DroughtMonitoringModule = DroughtMonitoringModule;
exports.DroughtMonitoringModule = DroughtMonitoringModule = __decorate([
    (0, common_1.Module)({
        imports: [credit_rating_module_1.CreditRatingModule],
        controllers: [drought_monitoring_controller_1.DroughtMonitoringController],
        providers: [drought_monitoring_service_1.DroughtMonitoringService, prisma_service_1.PrismaService],
        exports: [drought_monitoring_service_1.DroughtMonitoringService],
    })
], DroughtMonitoringModule);
//# sourceMappingURL=drought-monitoring.module.js.map