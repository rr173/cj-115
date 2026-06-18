import { Module } from '@nestjs/common';
import { QuotaController } from './quota.controller';
import { QuotaService } from './quota.service';
import { PrismaService } from '../prisma/prisma.service';
import { FarmerModule } from '../farmer/farmer.module';

@Module({
  imports: [FarmerModule],
  controllers: [QuotaController],
  providers: [QuotaService, PrismaService],
  exports: [QuotaService],
})
export class QuotaModule {}
