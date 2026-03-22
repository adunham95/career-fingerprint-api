import { Module } from '@nestjs/common';
import { AchievementModule } from 'src/achievement/achievement.module';
import { JobPositionsModule } from 'src/job-positions/job-positions.module';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { AuthModule as AppAuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AchievementModule, JobPositionsModule, AppAuthModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
