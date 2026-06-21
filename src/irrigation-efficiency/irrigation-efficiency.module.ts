import { Module } from '@nestjs/common';
import { IrrigationEfficiencyController } from './irrigation-efficiency.controller';
import { IrrigationEfficiencyService } from './irrigation-efficiency.service';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelModule } from '../channel/channel.module';
import { CreditRatingModule } from '../credit-rating/credit-rating.module';

@Module({
  imports: [ChannelModule, CreditRatingModule],
  controllers: [IrrigationEfficiencyController],
  providers: [IrrigationEfficiencyService, PrismaService],
  exports: [IrrigationEfficiencyService],
})
export class IrrigationEfficiencyModule {}
