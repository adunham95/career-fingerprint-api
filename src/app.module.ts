import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JobPositionsModule } from './job-positions/job-positions.module';
import { ResumeModule } from './resume/resume.module';
import { AchievementModule } from './achievement/achievement.module';
import { EducationModule } from './education/education.module';
import { RegisterModule } from './register/register.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { StripeModule } from './stripe/stripe.module';
import { JobApplicationsModule } from './job-applications/job-applications.module';
import { MeetingsModule } from './meetings/meetings.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    JobPositionsModule,
    ResumeModule,
    AchievementModule,
    EducationModule,
    RegisterModule,
    SubscriptionsModule,
    StripeModule,
    JobApplicationsModule,
    MeetingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
