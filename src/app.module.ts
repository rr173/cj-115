import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ChannelModule } from './channel/channel.module';
import { FarmerModule } from './farmer/farmer.module';
import { QuotaModule } from './quota/quota.module';
import { ApplicationModule } from './application/application.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { AccountingModule } from './accounting/accounting.module';
import { InspectionModule } from './inspection/inspection.module';
import { WaterBillingModule } from './water-billing/water-billing.module';
import { RotationalIrrigationModule } from './rotational-irrigation/rotational-irrigation.module';
import { WaterRightsTradingModule } from './water-rights-trading/water-rights-trading.module';
import { WaterLevelGateControlModule } from './water-level-gate-control/water-level-gate-control.module';
import { CreditRatingModule } from './credit-rating/credit-rating.module';
import { DroughtMonitoringModule } from './drought-monitoring/drought-monitoring.module';
import { IrrigationEfficiencyModule } from './irrigation-efficiency/irrigation-efficiency.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ChannelModule,
    FarmerModule,
    QuotaModule,
    ApplicationModule,
    SchedulingModule,
    AccountingModule,
    InspectionModule,
    WaterBillingModule,
    RotationalIrrigationModule,
    WaterRightsTradingModule,
    WaterLevelGateControlModule,
    CreditRatingModule,
    DroughtMonitoringModule,
    IrrigationEfficiencyModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
