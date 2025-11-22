import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FeatureFlag } from 'src/utils/featureFlags';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CacheService } from 'src/cache/cache.service';
import { StripeService } from 'src/stripe/stripe.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private stripe: StripeService,
    private mail: MailService,
  ) {}

  async createOrgManagedSubscription(
    createSubscription: CreateSubscriptionDto,
    emailType: 'newUser' | 'addToOrg' | 'none' = 'none',
  ) {
    console.log('creating org managed subscription', createSubscription);

    if (!createSubscription.orgID) {
      throw Error('Missing OrgID');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: createSubscription.userID },
      include: { subscriptions: true },
    });

    if (!user) {
      throw Error('Missing User');
    }

    await this.cache.del(`activeUserSubscription:${createSubscription.userID}`);

    const org = await this.prisma.organization.findFirst({
      where: { id: createSubscription.orgID },
    });

    if (!org || !org.defaultPlanID) {
      throw Error('Missing Org');
    }

    const currentUsersCount = await this.prisma.subscription.count({
      where: { managedByID: org?.id },
    });

    const defaultPlan = await this.cache.wrap(
      `plan:${org.defaultPlanID}`,
      () => {
        return this.prisma.plan.findFirst({
          where: { id: org.defaultPlanID || '' },
        });
      },
      86400,
    );

    if ((org?.seatCount || 0) <= currentUsersCount) {
      throw Error('Max Seats Claimed');
    }

    await this.prisma.subscription.create({
      data: {
        userID: createSubscription.userID,
        managedByID: org?.id,
        planID: org.defaultPlanID,
        status: 'org-managed',
      },
    });

    console.log({ emailType });

    switch (emailType) {
      case 'addToOrg':
        await this.mail.sendOrgUpgradedEmail({
          to: user.email,
          context: {
            firstName: user.firstName || '',
            orgName: org.name,
            tierName: defaultPlan?.name || 'Free',
          },
        });
        break;
      case 'newUser':
        await this.mail.sendWelcomeOrgEmail({
          to: user?.email,
          context: {
            firstName: user?.firstName || '',
            orgName: org.name,
            tierName: defaultPlan?.name || 'Free',
          },
        });
        break;

      default:
        break;
    }

    return await this.prisma.user.findFirst({
      where: { id: createSubscription.userID },
      include: { subscriptions: true },
    });
  }

  async upsetOrgManagedSubscription(createSubscription: CreateSubscriptionDto) {
    console.log('upserting org managed subscription', createSubscription);

    if (!createSubscription.orgID) {
      throw Error('Missing OrgID');
    }

    const currentSubscription = await this.prisma.subscription.findFirst({
      where: {
        status: 'org-managed',
        managedByID: createSubscription.orgID,
        userID: createSubscription.userID,
      },
    });

    if (currentSubscription) {
      console.log('user has current subscription', currentSubscription);
      return await this.prisma.user.findFirst({
        where: { id: createSubscription.userID },
        include: { subscriptions: true },
      });
    }

    await this.createOrgManagedSubscription(createSubscription);

    return await this.prisma.user.findFirst({
      where: { id: createSubscription.userID },
      include: { subscriptions: true },
    });
  }

  async createTempSubscription(
    priceID: string,
    sessionID: string,
    userID: number,
  ) {
    console.log({ priceID, sessionID, userID });
    const plan = await this.prisma.plan.findFirst({
      where: {
        OR: [
          { annualStripePriceID: priceID },
          { monthlyStripePriceID: priceID },
        ],
      },
    });

    if (!plan) {
      throw new HttpException('Missing Plans', HttpStatus.FAILED_DEPENDENCY);
    }

    await this.cache.del(`activeUserSubscription:${userID}`);

    return this.prisma.subscription.create({
      data: {
        userID,
        stripeSessionID: sessionID,
        planID: plan.id,
        status: 'temp',
      },
    });
  }

  findPlans() {
    return this.prisma.plan.findMany();
  }

  findPlanByID(id: string) {
    return this.cache.wrap(
      `plan:${id}`,
      () => {
        return this.prisma.plan.findFirst({
          where: { key: id },
        });
      },
      86400,
    );
  }

  async findUpgradePlan(planLevel: number) {
    const nextPlanLevel = planLevel + 1;

    return this.prisma.plan.findFirst({
      where: {
        level: nextPlanLevel,
        key: process.env.DEFAULT_SUBSCRIPTION_KEY || 'pro',
      },
      select: {
        id: true,
        annualStripePriceID: true,
        monthlyStripePriceID: true,
        priceCents: true,
        name: true,
        priceCentsYear: true,
        description: true,
        featureList: true,
      },
    });
  }

  async getActive(userID: number) {
    return this.cache.wrap(
      `activeUserSubscription:${userID}`,
      () => {
        return this.prisma.subscription.findFirst({
          where: {
            userID,
            status: {
              in: [
                'trialing',
                'active',
                'past_due',
                'temp',
                'org-managed',
                'canceling',
              ],
            },
            OR: [
              { currentPeriodEnd: null },
              { currentPeriodEnd: { gt: new Date() } },
            ], // optional: time-safe check
          },
          include: {
            plan: true,
          },
          orderBy: [
            {
              plan: {
                level: 'desc', // highest plan level first
              },
            },
            {
              createdAt: 'desc', // newest first
            },
          ],
        });
      },
      86400,
    );
  }

  async cancelCurrentSubscription(id: string) {
    try {
      const canceledSubscription = await this.prisma.subscription.findFirst({
        where: {
          id,
        },
      });

      if (!canceledSubscription) {
        throw Error('No Subscription found');
      }

      await this.cache.del(
        `activeUserSubscription:${canceledSubscription.userID}`,
      );

      const stripeID = canceledSubscription?.stripeSubId;

      console.log({ stripeID });

      if (stripeID) {
        await this.stripe.cancelSubscriptionAtPeriodEnd(stripeID);
      }
      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  }

  async hasFeature(userID: number, feature: FeatureFlag): Promise<boolean> {
    const sub = await this.getActive(userID);

    return sub?.plan?.features.includes(feature) ?? false;
  }
}
