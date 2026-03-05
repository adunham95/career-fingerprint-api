import { Module } from '@nestjs/common';
import { AchievementModule } from 'src/achievement/achievement.module';
import { JobPositionsModule } from 'src/job-positions/job-positions.module';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';

@Module({
  imports: [AchievementModule, JobPositionsModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
