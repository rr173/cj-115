"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const channel_module_1 = require("./channel/channel.module");
const farmer_module_1 = require("./farmer/farmer.module");
const quota_module_1 = require("./quota/quota.module");
const application_module_1 = require("./application/application.module");
const scheduling_module_1 = require("./scheduling/scheduling.module");
const accounting_module_1 = require("./accounting/accounting.module");
const inspection_module_1 = require("./inspection/inspection.module");
const water_billing_module_1 = require("./water-billing/water-billing.module");
const prisma_service_1 = require("./prisma/prisma.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            channel_module_1.ChannelModule,
            farmer_module_1.FarmerModule,
            quota_module_1.QuotaModule,
            application_module_1.ApplicationModule,
            scheduling_module_1.SchedulingModule,
            accounting_module_1.AccountingModule,
            inspection_module_1.InspectionModule,
            water_billing_module_1.WaterBillingModule,
        ],
        providers: [prisma_service_1.PrismaService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map