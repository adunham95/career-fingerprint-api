import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { getNextPreferredSendTime } from 'src/utils/nestFridayAt9UTC';

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
    const premiumUsers = await this.prisma.user.findMany({
      where: {
        nextSendAt: { lte: new Date() },
        subscriptions: {
          some: {
            status: {
              in: ['trialing', 'active', 'past_due', 'temp', 'canceling'],
            },
            plan: {
              level: {
                gt: 0,
              },
            },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        email: true,
        timezone: true,
        preferredDay: true,
      },
    });

    const promises = premiumUsers.map(async (user) => {
      await this.mailService.sendWeeklyReminderEmail({
        to: user.email,
        context: {
          firstName: user.firstName,
        },
      });
      const nextSendAt = getNextPreferredSendTime(
        user.timezone,
        user.preferredDay,
      );
      await this.prisma.user.update({
        where: { id: user.id },
        data: { nextSendAt },
      });
    });

    await Promise.all(promises);

    // console.log({ resolved });
  }

  async scheduleWeeklyEmailSend() {
    this.logger.log('Schedule Weekly Email Send Started');
    const premiumUsers = await this.prisma.user.findMany({
      where: {
        OR: [{ nextSendAt: null }, { nextSendAt: { lt: new Date() } }],
        subscriptions: {
          some: {
            status: {
              in: ['trialing', 'active', 'past_due', 'temp', 'canceling'],
            },
            plan: {
              level: {
                gt: 0,
              },
            },
          },
        },
      },
      select: {
        id: true,
        timezone: true,
        preferredDay: true,
      },
    });

    const promises = premiumUsers.map(async (user) => {
      const nextSendAt = getNextPreferredSendTime(
        user.timezone,
        user.preferredDay,
      );
      await this.prisma.user.update({
        where: { id: user.id },
        data: { nextSendAt },
      });
    });

    await Promise.all(promises);

    this.logger.log(
      `Schedule Weekly Email Send Finished. Updated ${premiumUsers.length} users`,
    );
  }
}
