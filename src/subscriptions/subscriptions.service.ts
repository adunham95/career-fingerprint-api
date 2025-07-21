import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FeatureFlag } from 'src/utils/featureFlags';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  findPlans() {
    return this.prisma.plan.findMany();
  }

  findPlanByID(id: string) {
    return this.prisma.plan.findFirst({ where: { key: id } });
  }

  getActive(userID: number) {
    return this.prisma.subscription.findFirst({
      where: {
        userID,
        status: { in: ['trialing', 'active', 'past_due'] },
        OR: [
          { currentPeriodEnd: null },
          { currentPeriodEnd: { gt: new Date() } },
        ], // optional: time-safe check
      },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });
  }

  async hasFeature(userID: number, feature: FeatureFlag): Promise<boolean> {
    const sub = await this.getActive(userID);

    return sub?.plan?.features.includes(feature) ?? false;
  }
}
