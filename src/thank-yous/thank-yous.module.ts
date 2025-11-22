import { Module } from '@nestjs/common';
import { ThankYousService } from './thank-yous.service';
import { ThankYousController } from './thank-yous.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  controllers: [ThankYousController],
  providers: [ThankYousService],
  imports: [PrismaModule, MailModule],
})
export class ThankYousModule {}
