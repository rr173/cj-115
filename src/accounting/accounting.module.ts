import { Module } from '@nestjs/common';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationModule } from '../application/application.module';
import { ChannelModule } from '../channel/channel.module';
import { FarmerModule } from '../farmer/farmer.module';

@Module({
  imports: [ApplicationModule, ChannelModule, FarmerModule],
  controllers: [AccountingController],
  providers: [AccountingService, PrismaService],
  exports: [AccountingService],
})
export class AccountingModule {}
