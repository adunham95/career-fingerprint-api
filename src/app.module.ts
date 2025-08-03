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
import { BullModule } from '@nestjs/bull';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailModule } from './mail/mail.module';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
// import { MjmlAdapter } from '@nestjs-modules/mailer/dist/adapters/mjml.adapter';
import { NotesModule } from './notes/notes.module';
import { HighlightsModule } from './highlights/highlights.module';
import { PrepModule } from './prep/prep.module';
import { AchievementTagsModule } from './achievement-tags/achievement-tags.module';
import { FeedbackModule } from './feedback/feedback.module';
import { TasksModule } from './tasks/tasks.module';
import path from 'path';

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
    MailModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '2525'),
        secure: false, // upgrade later with START
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      defaults: {
        from: process.env.SMTP_FROM,
      },
      template: {
        dir: process.cwd() + '/templates',
        adapter: new PugAdapter(),
        // adapter: new MjmlAdapter('pug', { inlineCssEnabled: false }),
        options: {
          strict: true,
        },
      },
      preview: {
        open: true, // opens in browser if supported
        dir: path.join(process.cwd(), 'previews'), // custom dir
      },
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '3000'),
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    NotesModule,
    HighlightsModule,
    PrepModule,
    AchievementTagsModule,
    FeedbackModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
