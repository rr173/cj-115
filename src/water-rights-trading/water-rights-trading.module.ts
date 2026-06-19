import { Module, forwardRef } from '@nestjs/common';
import { WaterRightsTradingController } from './water-rights-trading.controller';
import { WaterRightsTradingService } from './water-rights-trading.service';
import { PrismaService } from '../prisma/prisma.service';
import { WaterBillingModule } from '../water-billing/water-billing.module';
import { QuotaModule } from '../quota/quota.module';

@Module({
  imports: [forwardRef(() => WaterBillingModule), QuotaModule],
  controllers: [WaterRightsTradingController],
  providers: [WaterRightsTradingService, PrismaService],
  exports: [WaterRightsTradingService],
})
export class WaterRightsTradingModule {}
