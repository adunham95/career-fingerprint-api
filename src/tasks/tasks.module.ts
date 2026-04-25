import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TasksProcessor } from './tasks.processor';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';
import { AchievementModule } from 'src/achievement/achievement.module';
import { LoginTokenModule } from 'src/login-token/login-token.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({ name: 'tasks' }),
    PrismaModule,
    MailModule,
    AchievementModule,
    LoginTokenModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, TasksProcessor],
})
export class TasksModule {}
