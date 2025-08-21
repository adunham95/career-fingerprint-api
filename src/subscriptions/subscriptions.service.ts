import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FeatureFlag } from 'src/utils/featureFlags';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.plan.findFirst({ where: { key: id } });
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
    return await this.prisma.subscription.findFirst({
      where: {
        userID,
        status: { in: ['trialing', 'active', 'past_due', 'temp'] },
        OR: [
          { currentPeriodEnd: null },
          { currentPeriodEnd: { gt: new Date() } },
        ], // optional: time-safe check
      },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });
  }

  async cancelCurrentSubscription(id: string) {
    try {
      await this.prisma.subscription.update({
        where: {
          id,
        },
        data: {
          status: 'canceled-client',
        },
      });
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
