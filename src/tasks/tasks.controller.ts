import { Controller, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  private readonly logger = new Logger(TasksController.name);
  constructor(private readonly tasksService: TasksService) {}

  // ─── Cron Jobs ─────────────────────────────────────────────────────────────

  /**  Runs daily at 5:00 AM  */
  @Cron('0 5 * * *')
  handleDailyAtFive() {
    this.logger.log('Daily job at 5 AM');
  }

  /**  Runs friday every hour  */
  @Cron('0 * * * 5', { name: 'sendWeeklyEmail' })
  // @Cron('0/5 * * * *', { name: 'sendWeeklyEmail' })
  async handleSendWeeklyEmails() {
    await this.tasksService.runWeeklyEmailSend();
  }

  @Cron('0 0 * * 1-5', { name: 'scheduleWeeklyEmail' })
  // @Cron('*/5 * * * *', { name: 'scheduleWeeklyEmail' })
  async handleGenerateMissingUpcomingWeeklyEmails() {
    await this.tasksService.scheduleWeeklyEmailSend();
  }

  /** Runs daily at 9:00 AM EST (14:00 UTC) */
  @Cron('0 14 * * *', { name: 'checkAbandonedOnboarding' })
  async handleCheckAbandonedOnboarding() {
    await this.tasksService.checkAbandonedOnboarding();
  }
  // ─── Interval & Timeout ────────────────────────────────────────────────────

  /**  Runs once, 20 seconds after app start  */
  //   @Timeout(20_000)
  //   handleTimeout() {
  //     this.logger.debug('Called once after 20 seconds');
  //   }

  // ─── Dynamic Schedule's ────────────────────────────────────────────────────
}
