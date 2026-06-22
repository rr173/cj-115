"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmergencyApplicationModule = void 0;
const common_1 = require("@nestjs/common");
const emergency_application_controller_1 = require("./emergency-application.controller");
const emergency_application_service_1 = require("./emergency-application.service");
const prisma_service_1 = require("../prisma/prisma.service");
const credit_rating_module_1 = require("../credit-rating/credit-rating.module");
let EmergencyApplicationModule = class EmergencyApplicationModule {
};
exports.EmergencyApplicationModule = EmergencyApplicationModule;
exports.EmergencyApplicationModule = EmergencyApplicationModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => credit_rating_module_1.CreditRatingModule)],
        controllers: [emergency_application_controller_1.EmergencyApplicationController],
        providers: [emergency_application_service_1.EmergencyApplicationService, prisma_service_1.PrismaService],
        exports: [emergency_application_service_1.EmergencyApplicationService],
    })
], EmergencyApplicationModule);
//# sourceMappingURL=emergency-application.module.js.map