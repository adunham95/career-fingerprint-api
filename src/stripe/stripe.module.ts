// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { DynamicModule, Module } from '@nestjs/common';
// import { StripeService } from './stripe.service';
// import { StripeController } from './stripe.controller';
// import { PrismaModule } from '../prisma/prisma.module';
// import { StripeWebhookController } from './stripe.webhook.controller';

// @Module({})
// export class StripeModule {
//   static forRootAsync(): DynamicModule {
//     return {
//       module: StripeModule,
//       controllers: [StripeController, StripeWebhookController],
//       imports: [ConfigModule.forRoot(), PrismaModule],
//       exports: [StripeService],
//       providers: [
//         StripeService,
//         {
//           provide: 'STRIPE_API_SECRET',
//           useFactory: (configService: ConfigService) =>
//             // eslint-disable-next-line @typescript-eslint/no-unsafe-return
//             configService.get('STRIPE_API_SECRET'),
//           inject: [ConfigService],
//         },
//         {
//           provide: 'FRONT_END_URL',
//           useFactory: (configService: ConfigService) =>
//             // eslint-disable-next-line @typescript-eslint/no-unsafe-return
//             configService.get('FRONT_END_URL'),
//           inject: [ConfigService],
//         },
//       ],
//     };
//   }
// }

// stripe.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { StripeWebhookController } from './stripe.webhook.controller';
import { PrismaModule } from '../prisma/prisma.module';

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
