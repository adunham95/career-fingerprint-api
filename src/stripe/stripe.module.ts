// stripe.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { StripeWebhookController } from './stripe.webhook.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BullModule } from '@nestjs/bull';
import { StripeProcessor } from './stripe.processor';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    MailModule,
    BullModule.registerQueue({
      name: 'stripe',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
  ],
  controllers: [StripeController, StripeWebhookController],
  providers: [
    {
      provide: 'STRIPE_API_SECRET',
      useFactory: (configService: ConfigService) =>
        configService.get<string>('STRIPE_API_SECRET'),
      inject: [ConfigService],
    },
    {
      provide: 'FRONT_END_URL',
      useFactory: (configService: ConfigService) =>
        configService.get<string>('FRONT_END_URL'),
      inject: [ConfigService],
    },
    StripeService,
    StripeProcessor,
  ],
  exports: [StripeService],
})
export class StripeModule {}
