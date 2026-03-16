import { Module } from '@nestjs/common';
import { BetterAuthGuard } from './better-auth.guard';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { CacheModule } from 'src/cache/cache.module';
import { PermissionModule } from 'src/permission/permission.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    SubscriptionsModule,
    CacheModule,
    PermissionModule,
  ],
  providers: [BetterAuthGuard],
  exports: [BetterAuthGuard],
})
export class BetterAuthModule {}
