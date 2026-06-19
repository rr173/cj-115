"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaterRightsTradingModule = void 0;
const common_1 = require("@nestjs/common");
const water_rights_trading_controller_1 = require("./water-rights-trading.controller");
const water_rights_trading_service_1 = require("./water-rights-trading.service");
const prisma_service_1 = require("../prisma/prisma.service");
const water_billing_module_1 = require("../water-billing/water-billing.module");
const quota_module_1 = require("../quota/quota.module");
let WaterRightsTradingModule = class WaterRightsTradingModule {
};
exports.WaterRightsTradingModule = WaterRightsTradingModule;
exports.WaterRightsTradingModule = WaterRightsTradingModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => water_billing_module_1.WaterBillingModule), quota_module_1.QuotaModule],
        controllers: [water_rights_trading_controller_1.WaterRightsTradingController],
        providers: [water_rights_trading_service_1.WaterRightsTradingService, prisma_service_1.PrismaService],
        exports: [water_rights_trading_service_1.WaterRightsTradingService],
    })
], WaterRightsTradingModule);
//# sourceMappingURL=water-rights-trading.module.js.map