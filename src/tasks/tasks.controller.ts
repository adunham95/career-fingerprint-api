import {
  Controller,
  ForbiddenException,
  Get,
  Logger,
  Query,
} from '@nestjs/common';
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

  /**  Runs at the top of every hour  */
  @Cron(process.env.WEEKLY_EMAIL_CRON || '0 * * * *', {
    name: 'sendWeeklyEmail',
  })
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

  // ─── Dev Test Endpoints ─────────────────────────────────────────────────────

  @Get('test/weekly-email')
  async testWeeklyEmail() {
    console.log('test week emails');
    await this.tasksService.runWeeklyEmailSend();
    return true;
  }

  @Get('test/reset-next-send')
  async testResetNextSendAt(@Query('userId') userId?: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Not available in production');
    }
    const count = await this.tasksService.devResetNextSendAt(
      userId ? parseInt(userId, 10) : undefined,
    );
    return { updated: count };
  }
}
