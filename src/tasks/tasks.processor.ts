import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AchievementService } from 'src/achievement/achievement.service';
import { LoginTokenService } from 'src/login-token/login-token.service';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { getNextPreferredSendTime } from 'src/utils/nestFridayAt9UTC';

export interface WeeklyEmailJobData {
  userId: number;
  email: string;
  firstName: string;
  timezone: string;
  preferredDay: number;
}

@Processor('tasks')
export class TasksProcessor {
  private readonly logger = new Logger(TasksProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly achService: AchievementService,
    private readonly loginTokenService: LoginTokenService,
    private readonly mailService: MailService,
  ) {}

  @Process({ name: 'processWeeklyEmail', concurrency: 5 })
  async handleProcessWeeklyEmail(job: Job<WeeklyEmailJobData>) {
    const { userId, email, firstName, timezone, preferredDay } = job.data;

    try {
      const [streakCount, totalAchievements, loginLink] = await Promise.all([
        this.achService.getWeeklyStreak(userId, timezone),
        this.achService.getTotalAchievements(userId),
        this.loginTokenService.createBetterAuthMagicLink(
          email,
          `${process.env.FRONT_END_URL}/dashboard/weekly`,
        ),
      ]);

      await this.mailService.sendWeeklyReminderEmail({
        to: email,
        context: { firstName, streakCount, loginLink, totalAchievements },
      });

      const nextSendAt = getNextPreferredSendTime(timezone, preferredDay);
      await this.prisma.user.update({
        where: { id: userId },
        data: { nextSendAt },
      });
    } catch (error) {
      this.logger.error(`Failed to send weekly email for user ${userId}`, error);
      throw error;
    }
  }
}
