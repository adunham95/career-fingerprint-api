import { Module } from '@nestjs/common';
import { GoalService } from './goal.service';
import { GoalController } from './goal.controller';
import { BullModule } from '@nestjs/bull';
import { GoalProcessor } from './goal.processor';

@Module({
  controllers: [GoalController],
  providers: [GoalService, GoalProcessor],
  imports: [
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
