import { Module, forwardRef } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { PrismaService } from '../prisma/prisma.service';
import { FarmerModule } from '../farmer/farmer.module';
import { QuotaModule } from '../quota/quota.module';
import { ChannelModule } from '../channel/channel.module';
import { WaterBillingModule } from '../water-billing/water-billing.module';
import { RotationalIrrigationModule } from '../rotational-irrigation/rotational-irrigation.module';

@Module({
  imports: [FarmerModule, QuotaModule, ChannelModule, forwardRef(() => WaterBillingModule), RotationalIrrigationModule],
  controllers: [ApplicationController],
  providers: [ApplicationService, PrismaService],
  exports: [ApplicationService],
})
export class ApplicationModule {}
