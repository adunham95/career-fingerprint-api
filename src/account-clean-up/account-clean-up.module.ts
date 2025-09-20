import { Module } from '@nestjs/common';
import { AccountCleanUpService } from './account-clean-up.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StripeModule } from 'src/stripe/stripe.module';
import { AccountCleanUpWorker } from './account-clean-up.processor';
import { BullModule } from '@nestjs/bull';
@Module({
  providers: [AccountCleanUpService, AccountCleanUpWorker],
  imports: [
    PrismaModule,
    StripeModule,
    BullModule.registerQueue({
      name: 'cleanup',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
  ],
})
export class AccountCleanUpModule {}
