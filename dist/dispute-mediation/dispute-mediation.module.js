"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisputeMediationModule = void 0;
const common_1 = require("@nestjs/common");
const dispute_mediation_controller_1 = require("./dispute-mediation.controller");
const dispute_mediation_service_1 = require("./dispute-mediation.service");
const prisma_service_1 = require("../prisma/prisma.service");
const credit_rating_module_1 = require("../credit-rating/credit-rating.module");
let DisputeMediationModule = class DisputeMediationModule {
};
exports.DisputeMediationModule = DisputeMediationModule;
exports.DisputeMediationModule = DisputeMediationModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => credit_rating_module_1.CreditRatingModule)],
        controllers: [dispute_mediation_controller_1.DisputeMediationController],
        providers: [dispute_mediation_service_1.DisputeMediationService, prisma_service_1.PrismaService],
        exports: [dispute_mediation_service_1.DisputeMediationService],
    })
], DisputeMediationModule);
//# sourceMappingURL=dispute-mediation.module.js.map