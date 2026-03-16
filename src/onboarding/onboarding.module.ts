import { Module } from '@nestjs/common';
import { AchievementModule } from 'src/achievement/achievement.module';
import { JobPositionsModule } from 'src/job-positions/job-positions.module';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { AuthModule } from '@thallesp/nestjs-better-auth';

@Module({
  imports: [AchievementModule, JobPositionsModule, AuthModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
