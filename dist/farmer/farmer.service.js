"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FarmerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const channel_service_1 = require("../channel/channel.service");
const enums_1 = require("../common/enums");
let FarmerService = class FarmerService {
    constructor(prisma, channelService) {
        this.prisma = prisma;
        this.channelService = channelService;
    }
    async create(dto) {
        const exist = await this.prisma.farmer.findUnique({ where: { code: dto.code } });
        if (exist)
            throw new common_1.BadRequestException('用水户编号已存在');
        const channel = await this.prisma.channel.findUnique({ where: { id: dto.channelId } });
        if (!channel)
            throw new common_1.BadRequestException('农渠不存在');
        if (channel.level !== enums_1.ChannelLevel.FARM) {
            throw new common_1.BadRequestException('用水户只能关联到末级农渠(FARM级别)');
        }
        return this.prisma.farmer.create({ data: dto, include: { channel: true } });
    }
    async findAll() {
        return this.prisma.farmer.findMany({
            include: {
                channel: { select: { id: true, code: true, name: true } },
                quotas: true,
            },
            orderBy: { code: 'asc' },
        });
    }
    async findOne(id) {
        const farmer = await this.prisma.farmer.findUnique({
            where: { id },
            include: {
                channel: true,
                quotas: true,
                applications: { orderBy: { submitTime: 'desc' } },
            },
        });
        if (!farmer)
            throw new common_1.NotFoundException('用水户不存在');
        return farmer;
    }
    async findByCode(code) {
        const farmer = await this.prisma.farmer.findUnique({
            where: { code },
            include: { channel: true, quotas: true },
        });
        if (!farmer)
            throw new common_1.NotFoundException('用水户不存在');
        return farmer;
    }
    async update(id, dto) {
        const farmer = await this.prisma.farmer.findUnique({ where: { id } });
        if (!farmer)
            throw new common_1.NotFoundException('用水户不存在');
        if (dto.channelId) {
            const channel = await this.prisma.channel.findUnique({ where: { id: dto.channelId } });
            if (!channel)
                throw new common_1.BadRequestException('农渠不存在');
            if (channel.level !== enums_1.ChannelLevel.FARM) {
                throw new common_1.BadRequestException('用水户只能关联到末级农渠(FARM级别)');
            }
        }
        return this.prisma.farmer.update({ where: { id }, data: dto });
    }
    async remove(id) {
        const farmer = await this.prisma.farmer.findUnique({ where: { id } });
        if (!farmer)
            throw new common_1.NotFoundException('用水户不存在');
        return this.prisma.farmer.delete({ where: { id } });
    }
};
exports.FarmerService = FarmerService;
exports.FarmerService = FarmerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        channel_service_1.ChannelService])
], FarmerService);
//# sourceMappingURL=farmer.service.js.map