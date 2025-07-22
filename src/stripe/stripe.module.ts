// stripe.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { StripeWebhookController } from './stripe.webhook.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
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
  ],
  exports: [StripeService],
})
export class StripeModule {}
