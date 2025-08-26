import { Module } from '@nestjs/common';
import { OrgService } from './org.service';
import { OrgController } from './org.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StripeModule } from 'src/stripe/stripe.module';
import { MailModule } from 'src/mail/mail.module';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  controllers: [OrgController],
  providers: [OrgService],
  imports: [PrismaModule, StripeModule, MailModule, CacheModule],
  exports: [OrgService],
})
export class OrgModule {}
