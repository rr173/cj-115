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
exports.ChannelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const enums_1 = require("../common/enums");
const FLOW_SPEED = 0.8;
function calcPropagationDelay(length) {
    return Math.floor(length / FLOW_SPEED / 60);
}
let ChannelService = class ChannelService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validateTree(parentId, level) {
        if (level === enums_1.ChannelLevel.MAIN) {
            const existingMain = await this.prisma.channel.findFirst({
                where: { level: enums_1.ChannelLevel.MAIN },
            });
            if (existingMain) {
                throw new common_1.BadRequestException('干渠有且只有1条');
            }
            if (parentId) {
                throw new common_1.BadRequestException('干渠不能有上级渠道');
            }
            return;
        }
        if (!parentId) {
            throw new common_1.BadRequestException('非干渠必须指定上级渠道');
        }
        const parent = await this.prisma.channel.findUnique({ where: { id: parentId } });
        if (!parent) {
            throw new common_1.BadRequestException('上级渠道不存在');
        }
        const levelOrder = { MAIN: 0, BRANCH: 1, LATERAL: 2, FARM: 3 };
        if (levelOrder[parent.level] >= levelOrder[level]) {
            throw new common_1.BadRequestException('渠道级别必须低于上级渠道');
        }
        await this.detectCycle(parentId);
    }
    async detectCycle(startId) {
        const visited = new Set();
        let current = { id: startId, parentId: null };
        while (current) {
            if (visited.has(current.id)) {
                throw new common_1.BadRequestException('渠道树存在环');
            }
            visited.add(current.id);
            current = current.parentId
                ? await this.prisma.channel.findUnique({
                    where: { id: current.parentId },
                    select: { id: true, parentId: true },
                })
                : null;
        }
    }
    async create(dto) {
        await this.validateTree(dto.parentId ?? null, dto.level);
        if (dto.parentId) {
            const siblings = await this.prisma.channel.findMany({ where: { parentId: dto.parentId } });
            if (siblings.some((s) => s.code === dto.code)) {
                throw new common_1.BadRequestException('同级渠道编号重复');
            }
        }
        else {
            const exist = await this.prisma.channel.findUnique({ where: { code: dto.code } });
            if (exist)
                throw new common_1.BadRequestException('渠道编号已存在');
        }
        return this.prisma.channel.create({
            data: {
                ...dto,
                propagationDelay: calcPropagationDelay(dto.length),
            },
        });
    }
    async findAll() {
        return this.prisma.channel.findMany({
            include: { children: true, parent: { select: { id: true, code: true, name: true } } },
            orderBy: [{ level: 'asc' }, { code: 'asc' }],
        });
    }
    async findOne(id) {
        const channel = await this.prisma.channel.findUnique({
            where: { id },
            include: { children: true, parent: true, farmers: true },
        });
        if (!channel)
            throw new common_1.NotFoundException('渠道不存在');
        return channel;
    }
    async findByCode(code) {
        const channel = await this.prisma.channel.findUnique({
            where: { code },
            include: { parent: true },
        });
        if (!channel)
            throw new common_1.NotFoundException('渠道不存在');
        return channel;
    }
    async update(id, dto) {
        const channel = await this.prisma.channel.findUnique({ where: { id } });
        if (!channel)
            throw new common_1.NotFoundException('渠道不存在');
        const data = { ...dto };
        if (dto.length !== undefined) {
            data.propagationDelay = calcPropagationDelay(dto.length);
        }
        return this.prisma.channel.update({ where: { id }, data });
    }
    async remove(id) {
        const channel = await this.prisma.channel.findUnique({ where: { id } });
        if (!channel)
            throw new common_1.NotFoundException('渠道不存在');
        return this.prisma.channel.delete({ where: { id } });
    }
    async getPathToRoot(channelId) {
        const path = [];
        let currentId = channelId;
        while (currentId) {
            const ch = await this.prisma.channel.findUnique({
                where: { id: currentId },
                select: { id: true, code: true, level: true, propagationDelay: true, maxFlow: true, parentId: true },
            });
            if (!ch)
                break;
            path.push({ id: ch.id, code: ch.code, level: ch.level, propagationDelay: ch.propagationDelay, maxFlow: ch.maxFlow });
            currentId = ch.parentId;
        }
        return path;
    }
};
exports.ChannelService = ChannelService;
exports.ChannelService = ChannelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChannelService);
//# sourceMappingURL=channel.service.js.map