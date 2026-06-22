"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroundwaterModule = void 0;
const common_1 = require("@nestjs/common");
const groundwater_controller_1 = require("./groundwater.controller");
const groundwater_service_1 = require("./groundwater.service");
const prisma_service_1 = require("../prisma/prisma.service");
let GroundwaterModule = class GroundwaterModule {
};
exports.GroundwaterModule = GroundwaterModule;
exports.GroundwaterModule = GroundwaterModule = __decorate([
    (0, common_1.Module)({
        controllers: [groundwater_controller_1.GroundwaterController],
        providers: [groundwater_service_1.GroundwaterService, prisma_service_1.PrismaService],
        exports: [groundwater_service_1.GroundwaterService],
    })
], GroundwaterModule);
//# sourceMappingURL=groundwater.module.js.map