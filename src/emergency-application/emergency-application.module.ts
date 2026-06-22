import { Module, forwardRef } from '@nestjs/common';
import { EmergencyApplicationController } from './emergency-application.controller';
import { EmergencyApplicationService } from './emergency-application.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreditRatingModule } from '../credit-rating/credit-rating.module';

@Module({
  imports: [forwardRef(() => CreditRatingModule)],
  controllers: [EmergencyApplicationController],
  providers: [EmergencyApplicationService, PrismaService],
  exports: [EmergencyApplicationService],
})
export class EmergencyApplicationModule {}
