import { Module } from '@nestjs/common';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';
import { AutoSchedulingService } from './auto-scheduling.service';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelModule } from '../channel/channel.module';
import { ApplicationModule } from '../application/application.module';
import { FarmerModule } from '../farmer/farmer.module';

@Module({
  imports: [ChannelModule, ApplicationModule, FarmerModule],
  controllers: [SchedulingController],
  providers: [SchedulingService, AutoSchedulingService, PrismaService],
  exports: [SchedulingService, AutoSchedulingService],
})
export class SchedulingModule {}
