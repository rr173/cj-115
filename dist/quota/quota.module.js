"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotaModule = void 0;
const common_1 = require("@nestjs/common");
const quota_controller_1 = require("./quota.controller");
const quota_service_1 = require("./quota.service");
const prisma_service_1 = require("../prisma/prisma.service");
const farmer_module_1 = require("../farmer/farmer.module");
let QuotaModule = class QuotaModule {
};
exports.QuotaModule = QuotaModule;
exports.QuotaModule = QuotaModule = __decorate([
    (0, common_1.Module)({
        imports: [farmer_module_1.FarmerModule],
        controllers: [quota_controller_1.QuotaController],
        providers: [quota_service_1.QuotaService, prisma_service_1.PrismaService],
        exports: [quota_service_1.QuotaService],
    })
], QuotaModule);
//# sourceMappingURL=quota.module.js.map