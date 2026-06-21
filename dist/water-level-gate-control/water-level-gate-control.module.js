"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaterLevelGateControlModule = void 0;
const common_1 = require("@nestjs/common");
const water_level_gate_control_controller_1 = require("./water-level-gate-control.controller");
const water_level_gate_control_service_1 = require("./water-level-gate-control.service");
const prisma_service_1 = require("../prisma/prisma.service");
let WaterLevelGateControlModule = class WaterLevelGateControlModule {
};
exports.WaterLevelGateControlModule = WaterLevelGateControlModule;
exports.WaterLevelGateControlModule = WaterLevelGateControlModule = __decorate([
    (0, common_1.Module)({
        controllers: [water_level_gate_control_controller_1.WaterLevelGateControlController],
        providers: [water_level_gate_control_service_1.WaterLevelGateControlService, prisma_service_1.PrismaService],
        exports: [water_level_gate_control_service_1.WaterLevelGateControlService],
    })
], WaterLevelGateControlModule);
//# sourceMappingURL=water-level-gate-control.module.js.map