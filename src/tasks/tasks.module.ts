import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';
import { AchievementModule } from 'src/achievement/achievement.module';
import { LoginTokenModule } from 'src/login-token/login-token.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    MailModule,
    AchievementModule,
    LoginTokenModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
