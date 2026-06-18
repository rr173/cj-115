import { Module } from '@nestjs/common';
import { InspectionController } from './inspection.controller';
import { InspectionService } from './inspection.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [InspectionController],
  providers: [InspectionService, PrismaService],
  exports: [InspectionService],
})
export class InspectionModule {}
