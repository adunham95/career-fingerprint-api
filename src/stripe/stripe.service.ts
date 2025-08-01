import { InjectQueue } from '@nestjs/bull';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Queue } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @InjectQueue('stripe') private stripeQueue: Queue,
    @Inject('STRIPE_API_SECRET')
    private readonly secretKey: string,
    @Inject('FRONT_END_URL')
    private readonly frontEndUrl: string,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.secretKey, {
      apiVersion: '2025-05-28.basil',
    });
  }

  getStripe() {
    return this.stripe;
  }

  async newStripeCustomer(
    user: Partial<User> & Pick<User, 'id' | 'email'>,
    address?: { county: string; postal_code: string },
  ) {
    await this.stripeQueue.add('linkToStripe', {
      user,
      address,
    });
  }

  async createStripeCustomer(
    user: Partial<User> & Pick<User, 'id' | 'email'>,
    address?: { county: string; postal_code: string },
  ) {
    const stripeCustomer = await this.stripe.customers.create({
      email: user.email,
      address,
      metadata: { userID: user?.id },
    });

    return stripeCustomer;
  }

  async createTrialSubscription(user: User, priceID: string) {
    let stripeUserID = user?.stripeCustomerID || '';
    console.log({ stripeUserID });
    if (stripeUserID === null || stripeUserID === '') {
      console.log('need to generate stripe customer');
      const stripeCustomer = await this.stripe.customers.create({
        email: user.email,
        metadata: { userID: user?.id },
      });
      stripeUserID = stripeCustomer.id;
    }

    const subscription = await this.stripe.subscriptions.create({
      customer: stripeUserID,
      items: [{ price: priceID }],
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      trial_period_days: 14,
      metadata: {
        userId: user.id,
        planKey: 'Pro',
      },
      trial_settings: {
        end_behavior: { missing_payment_method: 'cancel' },
      },
    });

    return subscription;
  }

  async validateSubscription(sessionID: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        stripeSessionID: sessionID,
      },
    });

    if (!subscription) {
      throw new HttpException('No subscription', HttpStatus.FAILED_DEPENDENCY);
    }

    const session = await this.stripe.checkout.sessions.retrieve(sessionID, {
      expand: ['subscription'],
    });

    return this.prisma.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        status: session.payment_status === 'paid' ? 'active' : 'temp',
      },
      include: { plan: true },
    });
  }

  async createCheckoutSession(user: User, priceID: string) {
    console.log({ priceID });
    const stripeUserID = user?.stripeCustomerID || '';
    console.log({ stripeUserID });
    if (stripeUserID === null || stripeUserID === '') {
      throw Error('Missing stripeUserID');
    }

    const planDetails = await this.prisma.plan.findFirst({
      where: {
        OR: [
          { annualStripePriceID: priceID },
          { monthlyStripePriceID: priceID },
        ],
      },
    });

    if (!planDetails) {
      throw new Error(`No plan found for price ID: ${priceID}`);
    }

    const checkoutSession = await this.stripe.checkout.sessions.create({
      ui_mode: 'custom',
      customer: stripeUserID,
      line_items: [{ price: priceID, quantity: 1 }],
      metadata: {
        userId: user.id,
        planKey: planDetails?.key || 'pro',
      },
      mode: 'subscription',
      return_url: `${this.frontEndUrl}/settings/membership/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      expand: ['subscription'],
    });

    console.log({ checkoutSession });

    await this.prisma.subscription.create({
      data: {
        planID: planDetails.id,
        userID: user.id,
        stripeSessionID: checkoutSession.id,
        status: 'checkout',
      },
    });

    return {
      checkoutSessionClientSecret: checkoutSession.client_secret,
    };
  }
}
