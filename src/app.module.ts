import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ChannelModule } from './channel/channel.module';
import { FarmerModule } from './farmer/farmer.module';
import { QuotaModule } from './quota/quota.module';
import { ApplicationModule } from './application/application.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { AccountingModule } from './accounting/accounting.module';
import { InspectionModule } from './inspection/inspection.module';
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
  ],
  providers: [PrismaService],
})
export class AppModule {}
