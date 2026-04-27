import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { CronJob } from 'cron';
import { Queue } from 'bull';
import { LoginTokenService } from 'src/login-token/login-token.service';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FeatureFlags } from 'src/utils/featureFlags';
import { getNextPreferredSendTime } from 'src/utils/nestFridayAt9UTC';
import { WeeklyEmailJobData } from './tasks.processor';

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly loginTokenService: LoginTokenService,
    @InjectQueue('tasks') private readonly tasksQueue: Queue,
  ) {}

  createCronJob(
    name: string,
    cronTime: string,
    callback: () => void,
  ): { success: boolean; message?: string } {
    try {
      const job = new CronJob(cronTime, callback);
      this.schedulerRegistry.addCronJob(name, job);
      job.start();
      this.logger.log(`Cron job "${name}" created and started`);
      return {
        success: true,
        message: `Cron job "${name}" created and started`,
      };
    } catch (error) {
      this.logger.error(`Failed to create cron job "${name}":`, error);
      if (error instanceof TypeError) {
        return { success: false, message: error?.message };
      } else if (error instanceof Error) {
        return { success: false, message: error?.message };
      } else {
        return { success: false };
      }
    }
  }

  createIntervalJob(
    name: string,
    milliseconds: number,
    callback: () => void,
  ): { success: boolean; message?: string } {
    try {
      const interval = setInterval(callback, milliseconds);
      this.schedulerRegistry.addInterval(name, interval);
      this.logger.log(`Interval job "${name}" created and started`);
      return {
        success: true,
        message: `Interval job "${name}" created and started`,
      };
    } catch (error) {
      this.logger.error(`Failed to create interval job "${name}": `, error);
      if (error instanceof TypeError) {
        return { success: false, message: error?.message };
      } else if (error instanceof Error) {
        return { success: false, message: error?.message };
      } else {
        return { success: false };
      }
    }
  }

  createTimeoutJob(
    name: string,
    milliseconds: number,
    callback: () => void,
  ): { success: boolean; message?: string } {
    try {
      const timeout = setTimeout(callback, milliseconds);
      this.schedulerRegistry.addTimeout(name, timeout);
      this.logger.log(`Timeout job "${name}" created and started`);
      return {
        success: true,
        message: `Timeout job "${name}" created and started`,
      };
    } catch (error: unknown) {
      this.logger.error(`Failed to create timeout job "${name}":`, error);
      if (error instanceof TypeError) {
        return { success: false, message: error?.message };
      } else if (error instanceof Error) {
        return { success: false, message: error?.message };
      } else {
        return { success: false };
      }
    }
  }

  deleteJob(
    name: string,
    type: 'cron' | 'interval' | 'timeout',
  ): { success: boolean; message?: string } {
    try {
      switch (type) {
        case 'cron':
          this.schedulerRegistry.deleteCronJob(name);
          break;
        case 'interval':
          this.schedulerRegistry.deleteInterval(name);
          break;
        case 'timeout':
          this.schedulerRegistry.deleteTimeout(name);
          break;
      }
      this.logger.log(`Job "${name}" of type "${type}" deleted successfully`);
      return {
        success: true,
        message: `Job "${name}" of type "${type}" deleted successfully`,
      };
    } catch (error: unknown) {
      this.logger.error(`Failed to delete job "${name}"`, error);
      if (error instanceof TypeError) {
        return { success: false, message: error?.message };
      } else if (error instanceof Error) {
        return { success: false, message: error?.message };
      } else {
        return { success: false };
      }
    }
  }

  getAllJobs() {
    return {
      cron: this.schedulerRegistry.getCronJobs(),
      interval: this.schedulerRegistry.getIntervals(),
      timeout: this.schedulerRegistry.getTimeouts(),
    };
  }

  jobExists(name: string, type: 'cron' | 'interval' | 'timeout'): boolean {
    try {
      return this.schedulerRegistry.doesExist(type, name);
    } catch (error) {
      this.logger.error(`Error checking job existence`, error);
      return false;
    }
  }

  async stopJob(
    name: string,
    type: 'cron' | 'interval' | 'timeout',
  ): Promise<{ success: boolean; message?: string }> {
    try {
      switch (type) {
        case 'cron':
          await this.schedulerRegistry.getCronJob(name).stop();
          break;
        case 'interval':
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          clearInterval(this.schedulerRegistry.getInterval(name));
          break;
        case 'timeout':
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          clearTimeout(this.schedulerRegistry.getTimeout(name));
          break;
      }
      this.logger.log(`Job "${name}" of type "${type}" stopped successfully`);
      return {
        success: true,
        message: `Job "${name}" of type "${type}" stopped successfully`,
      };
    } catch (error: unknown) {
      this.logger.error(`Failed to stop job "${name}":`, error);
      if (error instanceof TypeError) {
        return { success: false, message: error?.message };
      } else if (error instanceof Error) {
        return { success: false, message: error?.message };
      } else {
        return { success: false };
      }
    }
  }

  startJob(
    name: string,
    type: 'cron' | 'interval' | 'timeout',
  ): { success: boolean; message?: string } {
    try {
      if (type === 'cron') {
        this.schedulerRegistry.getCronJob(name).start();
        this.logger.log(`Job "${name}" of type "cron" started successfully`);
        return {
          success: true,
          message: `Job "${name}" of type "cron" started successfully`,
        };
      } else {
        const msg = `${capitalize(type)} jobs cannot be restarted. Please recreate the job.`;
        this.logger.warn(msg);
        return { success: false, message: msg };
      }
    } catch (error) {
      this.logger.error(`Failed to start job "${name}":`, error);
      if (error instanceof TypeError) {
        return { success: false, message: error?.message };
      } else if (error instanceof Error) {
        return { success: false, message: error?.message };
      } else {
        return { success: false };
      }
    }
  }

  async runWeeklyEmailSend() {
    const eligibleUsers = await this.prisma.user.findMany({
      where: {
        weeklyReminderSettings: { nextSendAt: { lte: new Date() }, emailsDisabled: false },
        subscriptions: {
          some: {
            status: {
              in: ['trialing', 'active', 'past_due', 'temp', 'canceling'],
            },
            plan: { features: { has: FeatureFlags.WeeklyEmailSend } },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        email: true,
        timezone: true,
        weeklyReminderSettings: { select: { preferredDay: true, preferredHour: true } },
      },
    });

    const jobs = eligibleUsers.map((user) => ({
      name: 'processWeeklyEmail',
      data: {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        timezone: user.timezone,
        preferredDay: user.weeklyReminderSettings!.preferredDay,
        preferredHour: user.weeklyReminderSettings!.preferredHour,
      } satisfies WeeklyEmailJobData,
    }));

    await this.tasksQueue.addBulk(jobs);

    this.logger.log(
      `runWeeklyEmailSend: queued ${jobs.length} weekly email jobs`,
    );
  }

  async checkAbandonedOnboarding(): Promise<void> {
    const minAge = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const maxAge = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const users = await this.prisma.user.findMany({
      where: {
        createdAt: { gte: minAge, lte: maxAge },
        abandonedOnboardingEmailSentAt: null,
        email: { not: { endsWith: '@demo.com' } },
        subscriptions: {
          none: {
            status: {
              in: ['active', 'trialing', 'past_due', 'temp', 'canceling'],
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        _count: { select: { achievements: true } },
      },
    });

    for (const user of users) {
      const loginToken = await this.loginTokenService.createLoginToken(
        user.email,
        'onboarding',
        true,
      );
      const baseUrl = process.env.FRONT_END_URL;
      const redirectPath = '/onboard/achievement';
      const loginLink = `${baseUrl}/login/${loginToken.rawToken}?redirect=${redirectPath}`;

      await this.mailService.sendAbandonedOnboardingNoAchievementEmail({
        to: user.email,
        context: { firstName: user.firstName || undefined, loginLink },
      });

      await this.prisma.user.update({
        where: { id: user.id },
        data: { abandonedOnboardingEmailSentAt: new Date() },
      });
    }

    this.logger.log(
      `checkAbandonedOnboarding finished. Emailed ${users.length} users.`,
    );
  }

  async devResetNextSendAt(userId?: number): Promise<number> {
    const pastDate = new Date(0);
    if (userId !== undefined) {
      await this.prisma.weeklyReminderSettings.update({
        where: { userID: userId },
        data: { nextSendAt: pastDate },
      });
      return 1;
    }
    const { count } = await this.prisma.weeklyReminderSettings.updateMany({
      data: { nextSendAt: pastDate },
    });
    return count;
  }

  async scheduleWeeklyEmailSend() {
    this.logger.log('Schedule Weekly Email Send Started');
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { weeklyReminderSettings: null },
          { weeklyReminderSettings: { is: { nextSendAt: null } } },
          { weeklyReminderSettings: { is: { nextSendAt: { lt: new Date() } } } },
        ],
        NOT: { weeklyReminderSettings: { emailsDisabled: true } },
        subscriptions: {
          some: {
            status: {
              in: ['trialing', 'active', 'past_due', 'temp', 'canceling'],
            },
            plan: { features: { has: FeatureFlags.WeeklyEmailSend } },
          },
        },
      },
      select: {
        id: true,
        timezone: true,
        weeklyReminderSettings: { select: { preferredDay: true, preferredHour: true } },
      },
    });

    const promises = users.map(async (user) => {
      const preferredDay = user.weeklyReminderSettings?.preferredDay ?? 5;
      const preferredHour = user.weeklyReminderSettings?.preferredHour ?? 9;
      const nextSendAt = getNextPreferredSendTime(user.timezone, preferredDay, preferredHour);
      await this.prisma.weeklyReminderSettings.upsert({
        where: { userID: user.id },
        create: {
          userID: user.id,
          nextSendAt,
          preferredDay,
          preferredHour,
        },
        update: { nextSendAt },
      });
    });

    await Promise.all(promises);

    this.logger.log(
      `Schedule Weekly Email Send Finished. Updated ${users.length} users`,
    );
  }
}
