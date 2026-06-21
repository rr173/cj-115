"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulingModule = void 0;
const common_1 = require("@nestjs/common");
const scheduling_controller_1 = require("./scheduling.controller");
const scheduling_service_1 = require("./scheduling.service");
const auto_scheduling_service_1 = require("./auto-scheduling.service");
const prisma_service_1 = require("../prisma/prisma.service");
const channel_module_1 = require("../channel/channel.module");
const application_module_1 = require("../application/application.module");
const farmer_module_1 = require("../farmer/farmer.module");
const credit_rating_module_1 = require("../credit-rating/credit-rating.module");
let SchedulingModule = class SchedulingModule {
};
exports.SchedulingModule = SchedulingModule;
exports.SchedulingModule = SchedulingModule = __decorate([
    (0, common_1.Module)({
        imports: [channel_module_1.ChannelModule, application_module_1.ApplicationModule, farmer_module_1.FarmerModule, credit_rating_module_1.CreditRatingModule],
        controllers: [scheduling_controller_1.SchedulingController],
        providers: [scheduling_service_1.SchedulingService, auto_scheduling_service_1.AutoSchedulingService, prisma_service_1.PrismaService],
        exports: [scheduling_service_1.SchedulingService, auto_scheduling_service_1.AutoSchedulingService],
    })
], SchedulingModule);
//# sourceMappingURL=scheduling.module.js.map