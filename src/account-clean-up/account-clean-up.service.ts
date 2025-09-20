import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AccountCleanUpService {
  private readonly logger = new Logger(AccountCleanUpService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly cleanupQueue: Queue,
  ) {}

  @Cron('0 2 * * 6') // Saturdays at 2 AM
  async handleCron() {
    this.logger.log('Starting account cleanup batch enqueue...');

    // 1. Get deleted users
    const deletedUsers = await this.prisma.user.findMany({
      where: { accountStatus: 'deleted' },
      include: { subscriptions: true },
    });

    if (deletedUsers.length === 0) {
      this.logger.log('No users to clean up.');
      return;
    }

    const jobs = deletedUsers.map((u) =>
      this.cleanupQueue.add('cancel-user', { userId: u.id }),
    );

    await Promise.all(jobs);

    this.logger.log(`Enqueued ${deletedUsers.length} users for cleanup.`);
  }
}
