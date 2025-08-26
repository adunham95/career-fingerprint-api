import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { StripeModule } from 'src/stripe/stripe.module';
import { MailModule } from 'src/mail/mail.module';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    PrismaModule,
    SubscriptionsModule,
    StripeModule,
    MailModule,
    CacheModule,
  ],
  exports: [UsersService],
})
export class UsersModule {}
