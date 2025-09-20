import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';
import Stripe from 'stripe';

@Processor('cleanup') // queue name
export class AccountCleanUpWorker {
  private readonly logger = new Logger(AccountCleanUpWorker.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
  ) {}

  @Process('cancel-user')
  async handleCancelUser(job: Job<{ userId: number }>) {
    const { userId } = job.data;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscriptions: true },
    });

    if (!user) return;

    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        userID: userId,
        status: { in: ['active', 'trialing'] },
      },
    });

    for (const sub of subscriptions) {
      // Cancel Stripe subscription if exists
      if (sub.stripeSubId) {
        try {
          await this.stripe.cancelSubscriptionNow(sub.stripeSubId);
        } catch (err) {
          if (err instanceof Stripe.errors.StripeError) {
            if (err.code === 'resource_missing') {
              this.logger.log('Subscription Already Canceled');
              // subscription already canceled, ignore
            } else {
              throw err; // rethrow other Stripe errors
            }
          } else {
            throw err; // non-Stripe error
          }
        }
      }

      // Update subscription in DB
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { status: 'cancelled', currentPeriodEnd: new Date() },
      });
    }

    // Update user account status
    await this.prisma.user.update({
      where: { id: user.id },
      data: { accountStatus: 'cancelled' },
    });

    return { userId: user.id, status: 'done' };
  }
}
