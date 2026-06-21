import { Module, forwardRef } from '@nestjs/common';
import { DisputeMediationController } from './dispute-mediation.controller';
import { DisputeMediationService } from './dispute-mediation.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreditRatingModule } from '../credit-rating/credit-rating.module';

@Module({
  imports: [forwardRef(() => CreditRatingModule)],
  controllers: [DisputeMediationController],
  providers: [DisputeMediationService, PrismaService],
  exports: [DisputeMediationService],
})
export class DisputeMediationModule {}
