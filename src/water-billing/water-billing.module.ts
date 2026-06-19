import { Module, forwardRef } from '@nestjs/common';
import { WaterBillingController } from './water-billing.controller';
import { WaterBillingService } from './water-billing.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [WaterBillingController],
  providers: [WaterBillingService, PrismaService],
  exports: [WaterBillingService],
})
export class WaterBillingModule {}
