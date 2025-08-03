import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, MailModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
