"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationModule = void 0;
const common_1 = require("@nestjs/common");
const application_controller_1 = require("./application.controller");
const application_service_1 = require("./application.service");
const prisma_service_1 = require("../prisma/prisma.service");
const farmer_module_1 = require("../farmer/farmer.module");
const quota_module_1 = require("../quota/quota.module");
const channel_module_1 = require("../channel/channel.module");
const water_billing_module_1 = require("../water-billing/water-billing.module");
let ApplicationModule = class ApplicationModule {
};
exports.ApplicationModule = ApplicationModule;
exports.ApplicationModule = ApplicationModule = __decorate([
    (0, common_1.Module)({
        imports: [farmer_module_1.FarmerModule, quota_module_1.QuotaModule, channel_module_1.ChannelModule, (0, common_1.forwardRef)(() => water_billing_module_1.WaterBillingModule)],
        controllers: [application_controller_1.ApplicationController],
        providers: [application_service_1.ApplicationService, prisma_service_1.PrismaService],
        exports: [application_service_1.ApplicationService],
    })
], ApplicationModule);
//# sourceMappingURL=application.module.js.map