import { CreateStripeSubscriptionDto } from './dto/create-stripe-subscription.dto';
import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Organization, User } from '@prisma/client';
import { Queue } from 'bull';
import { CacheService } from 'src/cache/cache.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from 'src/users/entities/user.entity';
import Stripe from 'stripe';
import { DateTime } from 'luxon';
import Filter from 'leo-profanity';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    @InjectQueue('stripe') private stripeQueue: Queue,
    @Inject('STRIPE_API_SECRET')
    private readonly secretKey: string,
    @Inject('FRONT_END_URL')
    private readonly frontEndUrl: string,
    private prisma: PrismaService,
    private cache: CacheService,
  ) {
    this.stripe = new Stripe(this.secretKey, {
      apiVersion: '2025-08-27.basil',
    });
  }

  getStripe() {
    return this.stripe;
  }

  async newStripeCustomer({
    user,
    org,
    address,
  }: {
    user?: Partial<User> & Pick<User, 'id' | 'email'>;
    org?: Partial<Organization> & Pick<Organization, 'id' | 'email'>;
    address?: { county: string; postal_code: string };
  }) {
    await this.stripeQueue.add('linkToStripe', {
      user,
      org,
      address,
    });
  }

  async createStripeCustomer(
    user?: Partial<User> & Pick<User, 'id' | 'email'>,
    org?: Partial<Organization> & Pick<Organization, 'id' | 'email'>,
    address?: { country: string; postal_code: string },
  ) {
    if (user) {
      return this.stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        address,
        metadata: { userID: user?.id },
      });
    }
    if (org) {
      return await this.stripe.customers.create({
        email: org.email,
        name: org.name,
        address,
        metadata: { orgID: org.id },
      });
    }

    throw Error('No User or Org');
  }

  async createTrialSubscription({
    user,
    priceID,
    planID,
  }: CreateStripeSubscriptionDto) {
    let stripeUserID = user?.stripeCustomerID || '';
    console.log({ stripeUserID });

    if (user.redeemedFreeTrial) {
      throw Error('Cannot Redeem More Than 1 Free Trial');
    }

    if (stripeUserID === null || stripeUserID === '') {
      console.log('need to generate stripe customer');
      const stripeCustomer = await this.stripe.customers.create({
        email: user.email,
        metadata: { userID: user?.id },
      });
      stripeUserID = stripeCustomer.id;
    }

    let validReferralCode = false;

    const inviteCode = await this.prisma.inviteRedemption.findFirst({
      where: { inviterUserId: user.id },
    });
    if (inviteCode) {
      validReferralCode = true;
    }

    const subscription = await this.stripe.subscriptions.create({
      customer: stripeUserID,
      items: [{ price: priceID }],
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      trial_period_days: validReferralCode ? 30 : 14,
      metadata: {
        userID: user.id,
        planKey: 'Pro',
        planID,
      },
      trial_settings: {
        end_behavior: { missing_payment_method: 'cancel' },
      },
    });

    const trialExpiration = DateTime.now().plus({
      days: validReferralCode ? 30 : 14,
    });
    await this.prisma.subscription.create({
      data: {
        trialEndsAt: trialExpiration.toJSDate(),
        userID: user.id,
        planID,
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { redeemedFreeTrial: true },
    });

    await this.cache.del(`activeUserSubscription:${user.id}`);
    await this.cache.del(`currentUser:${user.id}`);

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

    await this.cache.del(`activeUserSubscription:${subscription.userID}`);

    return this.prisma.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        status: session.payment_status === 'paid' ? 'active' : 'temp',
      },
      include: { plan: true, org: { select: { id: true } } },
    });
  }

  async createCheckoutSession(
    user: UserEntity,
    priceID: string,
    couponID?: string,
  ) {
    const stripeUserID = user?.stripeCustomerID || '';
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
        userID: user.id,
        planKey: planDetails?.key || 'Pro',
        planID: planDetails.id,
      },
      subscription_data: {
        trial_period_days: !user.redeemedFreeTrial ? 14 : 0,
      },
      discounts: [
        {
          promotion_code: couponID,
        },
      ],
      mode: 'subscription',
      return_url: `${this.frontEndUrl}/settings/membership/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      expand: ['subscription'],
    });

    if (user.redeemedFreeTrial) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { redeemedFreeTrial: true },
      });
    }

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

  async createCheckoutSessionForOrg(
    user: UserEntity,
    priceID: string,
    quantity: number,
    orgID: string,
    couponID?: string,
  ) {
    console.log({ priceID, couponID });
    console.log({ user });

    const org = await this.prisma.organization.findFirst({
      where: { id: orgID },
    });

    const stripeUserID = org?.stripeCustomerID || '';
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
      line_items: [{ price: priceID, quantity }],
      metadata: {
        userID: user.id,
        planKey: planDetails?.key || 'Pro',
        planID: planDetails.id,
        orgID: orgID,
      },
      discounts: [
        {
          promotion_code: couponID,
        },
      ],
      mode: 'subscription',
      return_url: `${this.frontEndUrl}/org/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      expand: ['subscription'],
    });

    console.log({ checkoutSession });

    await this.prisma.subscription.create({
      data: {
        planID: planDetails.id,
        orgID: orgID,
        stripeSessionID: checkoutSession.id,
        status: 'checkout',
      },
    });

    return {
      checkoutSessionClientSecret: checkoutSession.client_secret,
    };
  }

  async createCheckoutSessionForCoach(
    user: UserEntity,
    planID: string,
    orgID: string,
    couponID?: string,
  ) {
    console.log({ planID, couponID });
    console.log({ user });

    const org = await this.prisma.organization.findFirst({
      where: { id: orgID },
    });

    const stripeUserID = org?.stripeCustomerID || '';
    console.log({ stripeUserID });
    if (stripeUserID === null || stripeUserID === '') {
      throw Error('Missing stripeUserID');
    }

    const planDetails = await this.prisma.plan.findFirst({
      where: {
        id: planID,
      },
    });

    if (!planDetails) {
      throw new Error(`No plan found for plan ID: ${planID}`);
    }

    if (!planDetails.monthlyStripePriceID || !planDetails.seatStripPriceID) {
      throw new Error(`No pricing ids for plan ID: ${planID}`);
    }

    const checkoutSession = await this.stripe.checkout.sessions.create({
      ui_mode: 'custom',
      customer: stripeUserID,
      line_items: [
        { price: planDetails.monthlyStripePriceID, quantity: 1 },
        { price: planDetails.seatStripPriceID },
      ],
      metadata: {
        userID: user.id,
        planKey: planDetails?.key || 'Pro',
        planID: planDetails.id,
        orgID: orgID,
      },
      discounts: [
        {
          promotion_code: couponID,
        },
      ],
      mode: 'subscription',
      return_url: `${this.frontEndUrl}/org/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      expand: ['subscription'],
    });

    console.log({ checkoutSession });

    await this.prisma.subscription.create({
      data: {
        planID: planDetails.id,
        orgID: orgID,
        stripeSessionID: checkoutSession.id,
        status: 'checkout',
        isMetered: true,
      },
    });

    return {
      checkoutSessionClientSecret: checkoutSession.client_secret,
    };
  }

  async updateBillingDetails(user: User) {
    const stripeUserID = user?.stripeCustomerID || '';
    console.log({ stripeUserID });
    if (stripeUserID === null || stripeUserID === '') {
      throw Error('Missing stripeUserID');
    }

    try {
      const checkoutSession = await this.stripe.setupIntents.create({
        customer: stripeUserID,
        payment_method_types: ['card'],
      });
      return {
        checkoutSessionClientSecret: checkoutSession.client_secret,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async validatePromo(code: string) {
    const internalPromo = await this.prisma.promoCode.findFirst({
      where: {
        code,
      },
    });

    if (!internalPromo) {
      return { valid: false };
    }

    const promo = await this.stripe.promotionCodes.list({
      code,
      active: true,
      limit: 1,
    });

    if (!promo.data.length) {
      return { valid: false };
    }

    return {
      valid: true,
      details: promo.data[0].coupon,
      id: promo.data[0].id,
      code: promo.data[0].code,
    };
  }

  async estimate({
    stripeCustomerID,
    promoID,
    priceID,
    quantity = 1,
  }: {
    stripeCustomerID?: string;
    promoID?: string;
    priceID: string;
    quantity?: number;
  }) {
    const subscriptionItems = [{ price: priceID, quantity }];

    const invoice = await this.stripe.invoices.createPreview({
      customer: stripeCustomerID,
      subscription_details: { items: subscriptionItems },
      discounts: promoID ? [{ promotion_code: promoID }] : undefined,
      automatic_tax: { enabled: stripeCustomerID ? true : false }, // ensures tax is included
    });

    console.log({ invoice });

    return {
      currency: invoice.currency,
      subtotal: invoice.subtotal,
      discounts: (invoice.total_discount_amounts ?? []).map((d) => ({
        amount: d.amount,
        discountId: d.discount,
        promoCode: d.discount,
      })),
      tax: invoice.total_taxes,
      total: invoice.total,
      formatted: {
        subtotal: (invoice.subtotal / 100).toFixed(2),
        total: (invoice.total / 100).toFixed(2),
      },
      lineItems: invoice.lines.data.map((line) => ({
        description: line.description,
        amount: line.amount,
        currency: line.currency,
      })),
    };
  }

  async cancelSubscriptionAtPeriodEnd(subscriptionId: string) {
    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  async cancelSubscriptionNow(subscriptionId: string) {
    return this.stripe.subscriptions.update(subscriptionId);
  }

  async createPromoCode(promoCode: string, orgID?: string | null) {
    const orgPlan = await this.prisma.subscription.findFirst({
      where: { orgID },
      select: {
        plan: { select: { features: true } },
      },
    });

    const featureList = orgPlan?.plan.features || [];

    if (!featureList.includes('org:createPromoCode')) {
      throw new InternalServerErrorException({
        code: 'PERMISSION_NOT_FOUND',
        message: 'Permission not provided.',
      });
    }

    console.log({ orgPlan, featureList });

    const stripePromoID = process.env.COACH_COUPON_ID || '';

    if (!stripePromoID) {
      throw new InternalServerErrorException({
        code: 'STRIPE_COUPON_NOT_CONFIGURED',
        message: 'Promo code system is not configured.',
      });
    }

    if (promoCode && featureList.includes('org:createCustomPromoCode')) {
      const matchesPattern = /^[A-Z0-9][A-Z0-9-]{2,18}[A-Z0-9]$/.test(
        promoCode,
      );

      if (!matchesPattern) {
        throw new BadRequestException({
          code: 'INVALID_PROMO_CODE_FORMAT',
          message:
            'Promo code must be 4-20 characters and use only A-Z, 0-9, and hyphens.',
        });
      }

      const RESERVED_WORDS = [
        'FREE',
        'ADMIN',
        'ROOT',
        'SUPPORT',
        'CAREERFINGERPRINT',
        'STRIPE',
        '100OFF',
        'LIFETIME',
        'UNLIMITED',
        'TEST',
      ];

      const normalized = promoCode.replace(/-/g, '');
      for (const word of RESERVED_WORDS) {
        if (normalized.includes(word)) {
          throw new BadRequestException({
            code: 'INVALID_PROMO_CODE',
            message: 'Promo code contains invalid text.',
          });
        }
      }

      if (Filter.check(promoCode)) {
        throw new BadRequestException({
          code: 'PROFANE_PROMO_CODE',
          message: 'Promo code contains inappropriate language.',
        });
      }

      try {
        const promoData = await this.prisma.promoCode.create({
          data: {
            code: promoCode,
            orgId: orgID,
          },
        });

        await this.stripe.promotionCodes.create({
          code: promoCode,
          coupon: stripePromoID,
        });
        return promoData;
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ConflictException({
              code: 'PROMO_CODE_EXISTS',
              message: 'This promo code is already in use.',
            });
          }
        }
        throw error;
      }
    } else {
      const generatedPromoCode = await this.createGeneratedCoupon(orgID);
      await this.stripe.promotionCodes.create({
        code: generatedPromoCode.code,
        coupon: stripePromoID,
      });
      return generatedPromoCode;
    }
  }

  async processEligibleRewards() {
    const now = new Date();
    const eligible = await this.prisma.inviteRedemption.findMany({
      where: {
        rewardStatus: 'eligible',
        eligibleAt: { lte: now },
      },
    });

    for (const redemption of eligible) {
      const inviter = await this.prisma.user.findUnique({
        where: { id: redemption.inviterUserId },
      });
      if (!inviter?.stripeCustomerID) continue;

      await this.stripe.customers.createBalanceTransaction(
        inviter.stripeCustomerID,
        {
          amount: 200,
          currency: 'usd',
          description: 'Referral reward',
        },
      );

      await this.prisma.inviteRedemption.update({
        where: { id: redemption.id },
        data: { rewardStatus: 'credited', creditedAt: new Date() },
      });
    }
  }

  async processClientCount() {
    const today = new Date();

    const subscriptions = await this.prisma.subscription.findMany({
      where: { status: 'active', isMetered: true },
      include: { org: true },
    });

    for (const sub of subscriptions) {
      if (!sub.orgID) continue;
      if (!sub.currentPeriodStart) continue;

      const currentSeats = await this.calculateCurrentSeats(sub.orgID);

      let newPeak = sub.meterCyclePeakSeats || 0;

      if (currentSeats > newPeak) {
        newPeak = currentSeats;

        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: { meterCyclePeakSeats: newPeak },
        });
      }

      const periodStart = sub.currentPeriodStart;
      const isStart =
        today.getUTCFullYear() === periodStart.getUTCFullYear() &&
        today.getUTCMonth() === periodStart.getUTCMonth() &&
        today.getUTCDate() === periodStart.getUTCDate();

      if (!isStart) continue;

      if (sub.org?.stripeCustomerID) {
        await this.stripe.billing.meterEvents.create({
          event_name: 'coach_clients',
          payload: {
            value: newPeak.toString(),
            stripe_customer_id: sub.org.stripeCustomerID,
          },
        });
      }

      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: {
          meterCyclePeakSeats: currentSeats,
        },
      });

      await this.prisma.organization.update({
        where: { id: sub.orgID },
        data: { currentSeats },
      });
    }
  }

  private async calculateCurrentSeats(orgId?: string): Promise<number> {
    if (!orgId) {
      return 0;
    }

    const active = await this.prisma.subscription.count({
      where: {
        managedByID: orgId,
        status: 'org-managed',
      },
    });
    return active;
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async runDailyReferralCredits() {
    this.logger.log('Running daily referral credit job...');
    await this.processEligibleRewards();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runDailyActiveClientCount() {
    this.logger.log('Running daily active client count...');
    await this.processClientCount();
  }

  async createGeneratedCoupon(orgId?: string | null) {
    for (let i = 0; i < 5; i++) {
      const code = this.generatePromoCode('CF');

      try {
        return await this.prisma.promoCode.create({
          data: {
            orgId,
            code,
            source: 'SYSTEM',
          },
        });
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          // Check for the unique constraint violation error code
          if (error.code === 'P2002') {
            // Provide a user-friendly error message, e.g., "An account with this email already exists"
            console.error(
              'Unique constraint failed: The provided email is already in use.',
            );
            throw new ConflictException({
              code: 'PROMO_CODE_EXISTS',
              message: 'This promo code is already in use.',
            });
            // You can then throw a new, more descriptive error or return a specific response
          }
        }
        // Re-throw other errors if not handled specifically
        throw error;
      }
    }

    throw new Error('Failed to generate unique promo code');
  }

  generatePromoCode(prefix = 'CF'): string {
    const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const segment = (len: number) =>
      Array.from(
        { length: len },
        () => CHARSET[Math.floor(Math.random() * CHARSET.length)],
      ).join('');

    return `${prefix}-${segment(4)}-${segment(3)}`;
  }
}
