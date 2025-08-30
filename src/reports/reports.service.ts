import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  getTopEmployers(orgID: string) {
    return this.cache.wrap(
      `reports:${orgID}:topEmployers`,
      async () => {
        const result = await this.prisma.jobPosition.groupBy({
          by: ['company'],
          where: { user: { orgID } },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10,
        });
        return result.map((r) => ({ company: r.company, count: r._count.id }));
      },
      1800, // cache 30 mins
    );
  }

  async getSeatUtilization(orgID: string) {
    return this.cache.wrap(
      `reports:${orgID}:seatUtilization`,
      async () => {
        const org = await this.prisma.organization.findUnique({
          where: { id: orgID },
          select: { seatCount: true, _count: { select: { admins: true } } },
        });
        const users = await this.prisma.user.count({ where: { orgID } });
        return {
          seatsUsed: users,
          seatLimit: org?.seatCount ?? 0,
          admins: org?._count.admins ?? 0,
        };
      },
      600, // cache 10 mins
    );
  }

  async getActiveVsInactive(orgID: string) {
    return this.cache.wrap(
      `reports:${orgID}:activeInactive`,
      async () => {
        // Active = saved an achievement in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeUsers = await this.prisma.user.count({
          where: {
            orgID,
            achievements: {
              some: { createdAt: { gte: thirtyDaysAgo } },
            },
          },
        });

        const totalUsers = await this.prisma.user.count({ where: { orgID } });
        const inactiveUsers = totalUsers - activeUsers;

        return { activeUsers, inactiveUsers, totalUsers };
      },
      600, // cache 10 mins
    );
  }
}
