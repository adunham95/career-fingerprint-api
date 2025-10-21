import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { CacheService } from 'src/cache/cache.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}
  async getAdminDashboard() {
    const totalUsers = await this.prisma.user.count();
    const newSignups = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: DateTime.now().minus({ hours: 24 }).toJSDate(),
        },
      },
    });
    const premiumUsers = await this.prisma.user.count({
      where: {
        subscriptions: {
          some: {
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
            plan: {
              level: {
                gt: 0,
              },
            },
          },
        },
      },
    });

    const orgs = await this.prisma.organization.count();
    return { totalUsers, premiumUsers, newSignups, orgs };
  }
}
