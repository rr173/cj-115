import { Module } from '@nestjs/common';
import { DroughtMonitoringController } from './drought-monitoring.controller';
import { DroughtMonitoringService } from './drought-monitoring.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreditRatingModule } from '../credit-rating/credit-rating.module';

@Module({
  imports: [CreditRatingModule],
  controllers: [DroughtMonitoringController],
  providers: [DroughtMonitoringService, PrismaService],
  exports: [DroughtMonitoringService],
})
export class DroughtMonitoringModule {}
