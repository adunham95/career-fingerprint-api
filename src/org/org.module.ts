import { Module } from '@nestjs/common';
import { OrgService } from './org.service';
import { OrgController } from './org.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StripeModule } from 'src/stripe/stripe.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  controllers: [OrgController],
  providers: [OrgService],
  imports: [PrismaModule, StripeModule, MailModule],
  exports: [OrgService],
})
export class OrgModule {}
