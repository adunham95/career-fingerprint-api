import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { UsersModule } from 'src/users/users.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService],
  imports: [UsersModule, PrismaModule, MailModule, SubscriptionsModule],
})
export class ClientsModule {}
