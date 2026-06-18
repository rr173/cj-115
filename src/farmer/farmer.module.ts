import { Module } from '@nestjs/common';
import { FarmerController } from './farmer.controller';
import { FarmerService } from './farmer.service';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelModule } from '../channel/channel.module';

@Module({
  imports: [ChannelModule],
  controllers: [FarmerController],
  providers: [FarmerService, PrismaService],
  exports: [FarmerService],
})
export class FarmerModule {}
