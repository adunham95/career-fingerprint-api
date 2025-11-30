import { Module } from '@nestjs/common';
import { GoalService } from './goal.service';
import { GoalController } from './goal.controller';
import { BullModule } from '@nestjs/bull';
import { GoalProcessor } from './goal.processor';
import { MailModule } from 'src/mail/mail.module';
import { SseModule } from 'src/sse/sse.module';

@Module({
  controllers: [GoalController],
  providers: [GoalService, GoalProcessor],
  imports: [
    MailModule,
    SseModule,
    BullModule.registerQueue({
      name: 'goal',
      defaultJobOptions: {
        attempts: process.env.NODE_ENV === 'production' ? 3 : 1,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
  ],
  exports: [GoalService, BullModule],
})
export class GoalModule {}
