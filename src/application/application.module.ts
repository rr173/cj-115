import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { PrismaService } from '../prisma/prisma.service';
import { FarmerModule } from '../farmer/farmer.module';
import { QuotaModule } from '../quota/quota.module';
import { ChannelModule } from '../channel/channel.module';

@Module({
  imports: [FarmerModule, QuotaModule, ChannelModule],
  controllers: [ApplicationController],
  providers: [ApplicationService, PrismaService],
  exports: [ApplicationService],
})
export class ApplicationModule {}
