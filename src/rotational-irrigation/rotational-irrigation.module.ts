import { Module } from '@nestjs/common';
import { RotationalIrrigationController } from './rotational-irrigation.controller';
import { RotationalIrrigationService } from './rotational-irrigation.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RotationalIrrigationController],
  providers: [RotationalIrrigationService, PrismaService],
  exports: [RotationalIrrigationService],
})
export class RotationalIrrigationModule {}
