"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotationalIrrigationModule = void 0;
const common_1 = require("@nestjs/common");
const rotational_irrigation_controller_1 = require("./rotational-irrigation.controller");
const rotational_irrigation_service_1 = require("./rotational-irrigation.service");
const prisma_service_1 = require("../prisma/prisma.service");
let RotationalIrrigationModule = class RotationalIrrigationModule {
};
exports.RotationalIrrigationModule = RotationalIrrigationModule;
exports.RotationalIrrigationModule = RotationalIrrigationModule = __decorate([
    (0, common_1.Module)({
        controllers: [rotational_irrigation_controller_1.RotationalIrrigationController],
        providers: [rotational_irrigation_service_1.RotationalIrrigationService, prisma_service_1.PrismaService],
        exports: [rotational_irrigation_service_1.RotationalIrrigationService],
    })
], RotationalIrrigationModule);
//# sourceMappingURL=rotational-irrigation.module.js.map