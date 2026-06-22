import { Module } from '@nestjs/common';
import { GroundwaterController } from './groundwater.controller';
import { GroundwaterService } from './groundwater.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [GroundwaterController],
  providers: [GroundwaterService, PrismaService],
  exports: [GroundwaterService],
})
export class GroundwaterModule {}
