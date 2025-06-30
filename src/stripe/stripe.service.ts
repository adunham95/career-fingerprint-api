import { Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';
// import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private prisma: PrismaService;

  constructor(
    @Inject('STRIPE_API_SECRET')
    private readonly secretKey: string,
    @Inject('FRONT_END_URL')
    private readonly frontEndUrl: string,
  ) {
    this.stripe = new Stripe(this.secretKey, {
      apiVersion: '2025-05-28.basil',
    });
  }

  getStripe() {
    return this.stripe;
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

    if (stripeUserID !== 'string')
      throw Error(`Stripe User id: ${stripeUserID} does not exist`);

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
}
