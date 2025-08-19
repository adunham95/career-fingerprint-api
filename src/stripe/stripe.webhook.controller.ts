import { MailService } from 'src/mail/mail.service';
import {
  Controller,
  Post,
  Req,
  Res,
  Inject,
  Headers,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

@Controller('webhook')
export class StripeWebhookController {
  private stripe: Stripe;

  constructor(
    @Inject('STRIPE_API_SECRET')
    private readonly secretKey: string,
    private prisma: PrismaService,
    private mailService: MailService,
  ) {
    this.stripe = new Stripe(this.secretKey, {
      apiVersion: '2025-05-28.basil',
    });
  }

  @Post()
  async handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      throw Error('Missing stripe key');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body as Buffer,
        signature,
        endpointSecret,
      );
    } catch (error) {
      if (error instanceof TypeError) {
        console.error('Webhook Error:', error?.message);
        return { success: false, message: error?.message };
      } else if (error instanceof Error) {
        console.error('Webhook Error:', error?.message);
        return { success: false, message: error?.message };
      } else {
        console.error('Webhook Error', error);
        return { success: false };
      }
    }
    // 🎯 Handle the event
    switch (event.type) {
      case 'customer.updated':
        // const customerUpdated = event.data.object;
        // console.log('✅ Customer Updated:', customerUpdated);
        // Then define and call a function to handle the event customer.updated
        break;
      case 'checkout.session.completed': {
        const session = event.data.object;

        const subscription = await this.prisma.subscription.updateManyAndReturn(
          {
            where: {
              stripeSessionID: session.id,
            },
            data: {
              status: 'active',
            },
            include: {
              user: true,
            },
          },
        );

        const user = subscription?.[0].user;

        if (user) {
          await this.mailService.sendPremiumIntoEmail({
            to: user.email,
            context: { firstName: user.firstName },
          });
        }

        console.log('✅ Checkout complete:', session);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('✅ Invoice paid:', invoice.id);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log(' Invoice payment failed:', invoice.id);
        break;
      }
      case 'customer.subscription.created': {
        const newSubscription = event.data.object;
        console.log('✅ New Subscription:', newSubscription);
        if (newSubscription.metadata.userID && newSubscription.metadata.planID)
          await this.prisma.subscription.create({
            data: {
              userID: parseInt(newSubscription.metadata.userID),
              planID: newSubscription.metadata.planID,
              stripeSubId: newSubscription.id,
              status: 'active',
            },
          });
        break;
      }
      case 'customer.subscription.updated': {
        const newSubscription = event.data.object;

        console.log('✅ New Subscription:', newSubscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await this.prisma.subscription.updateMany({
          where: {
            stripeSubId: subscription.id,
          },
          data: {
            status: 'canceled-stripe',
          },
        });
        console.log('✅ New Subscription:', subscription);
        break;
      }
      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object;
        console.log('trial will end', subscription);

        const subscriptionDetails = await this.prisma.subscription.findFirst({
          where: {
            stripeSubId: subscription.id,
          },
          include: {
            user: { select: { email: true, firstName: true } },
            plan: { select: { name: true } },
          },
        });

        if (subscriptionDetails) {
          // TODO handle send wait emails
        }

        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(HttpStatus.OK).send({ received: true });
  }

  async handleInvoicePaid(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;

    const invitee = await this.prisma.user.findFirst({
      where: { stripeCustomerID: customerId },
      include: { receivedRedemptions: true },
    });

    if (!invitee) return;

    // only first real invoice after trial counts
    if (invoice.billing_reason !== 'subscription_cycle') return;

    const redemption = invitee?.receivedRedemptions[0];
    if (!redemption) return;
    if (redemption.rewardStatus !== 'pending') return;

    let pmId: string | null = null;

    // ✅ Step 1. Verify payment method
    if ('payment_intent' in invoice && invoice.payment_intent) {
      const pi = await this.stripe.paymentIntents.retrieve(
        invoice.payment_intent as string,
      );
      pmId = pi.payment_method as string;
    } else if (invoice.default_payment_method) {
      pmId = invoice.default_payment_method as string;
    }

    if (!pmId) return;

    const pm = await this.stripe.paymentMethods.retrieve(pmId);
    if (pm.card) {
      if (pm.card.funding === 'prepaid') {
        // mark as failed / blocked
        await this.prisma.inviteRedemption.update({
          where: { id: redemption.id },
          data: { rewardStatus: 'failed' },
        });
        return;
      }
    }

    // ✅ Step 2. Set delayed eligibility (7 days buffer)
    const eligibleDate = new Date();
    eligibleDate.setDate(eligibleDate.getDate() + 7);

    await this.prisma.inviteRedemption.update({
      where: { id: redemption.id },
      data: {
        rewardStatus: 'eligible',
        eligibleAt: eligibleDate,
      },
    });
  }
}
