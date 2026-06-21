import { Module } from '@nestjs/common';
import { CreditRatingController } from './credit-rating.controller';
import { CreditRatingService } from './credit-rating.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CreditRatingController],
  providers: [CreditRatingService, PrismaService],
  exports: [CreditRatingService],
})
export class CreditRatingModule {}
