import { Module } from '@nestjs/common';
import { WaterLevelGateControlController } from './water-level-gate-control.controller';
import { WaterLevelGateControlService } from './water-level-gate-control.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [WaterLevelGateControlController],
  providers: [WaterLevelGateControlService, PrismaService],
  exports: [WaterLevelGateControlService],
})
export class WaterLevelGateControlModule {}
