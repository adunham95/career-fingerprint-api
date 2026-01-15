import { Module } from '@nestjs/common';
import { OrgUsersService } from './org-users.service';
import { OrgUsersController } from './org-users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StripeModule } from 'src/stripe/stripe.module';
import { MailModule } from 'src/mail/mail.module';
import { PermissionModule } from 'src/permission/permission.module';
import { CacheModule } from 'src/cache/cache.module';
import { OrgModule } from 'src/org/org.module';

@Module({
  controllers: [OrgUsersController],
  providers: [OrgUsersService],
  imports: [
    PrismaModule,
    StripeModule,
    MailModule,
    CacheModule,
    PermissionModule,
    OrgModule,
  ],
  exports: [OrgUsersService],
})
export class OrgUsersModule {}
