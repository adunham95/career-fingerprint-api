import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CacheService } from 'src/cache/cache.service';
import { DateTime } from 'luxon';

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
          // TODO Fix that calulations
          // where: { user:  },
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
          select: {
            seatCount: true,
            _count: { select: { orgAdminLinks: true } },
          },
        });
        const users = await this.prisma.user.count({
          where: {
            subscriptions: {
              some: {
                managedByID: orgID,
                status: 'org-managed',
              },
            },
          },
        });
        return {
          seatsUsed: users,
          seatLimit: org?.seatCount ?? 0,
          admins: org?._count.orgAdminLinks ?? 0,
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
            subscriptions: {
              some: {
                managedByID: orgID,
              },
            },
            achievements: {
              some: { createdAt: { gte: thirtyDaysAgo } },
            },
          },
        });

        const totalUsers = await this.prisma.user.count({
          where: {
            subscriptions: {
              some: {
                managedByID: orgID,
              },
            },
          },
        });
        const inactiveUsers = totalUsers - activeUsers;

        return { activeUsers, inactiveUsers, totalUsers };
      },
      1, // cache 10 mins
    );
  }

  async getWeeklyReportCached(orgID: string) {
    return this.generateWeeklyReport(orgID);
    // const key = `weeklyReport:${orgID}:${DateTime.now().weekNumber}`;
    // return this.cache.wrap(
    //   key,
    //   () => {
    //     return this.generateWeeklyReport(orgID);
    //   },
    //   1,
    // ); // TTL 5 min
  }

  async generateWeeklyReport(orgID: string) {
    const now = DateTime.now();

    // Monday of this week
    const weekStart = now.set({ weekday: 1 }).startOf('day');

    // Sunday of this week
    const weekEnd = now.set({ weekday: 7 }).endOf('day');

    const [achievements, jobPositions] = await Promise.all([
      this.prisma.achievement.findMany({
        where: {
          createdAt: { gte: weekStart.toJSDate(), lt: weekEnd.toJSDate() },
          user: {
            subscriptions: {
              some: {
                managedByID: orgID,
                status: 'org-managed',
              },
            },
          },
        },
        include: { user: true, tags: true },
      }),
      this.prisma.jobPosition.findMany({
        where: {
          user: {
            subscriptions: {
              some: {
                managedByID: orgID,
                status: 'org-managed',
              },
            },
          },
          currentPosition: true,
        },
      }),
    ]);

    console.log(jobPositions);

    // ---- Totals and averages ----
    const totalAchievements = achievements.length;
    const uniqueUsers = new Set(achievements.map((a) => a.userID)).size;
    const avgAchievementsPerUser = uniqueUsers
      ? totalAchievements / uniqueUsers
      : 0;

    // ---- Top tags ----
    const tagCounts: Record<string, number> = {};
    for (const a of achievements) {
      for (const tag of a.tags) {
        tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
      }
    }
    const topTags = Object.entries(tagCounts)
      .map(([tagName, count]) => ({ tagName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // ---- Top employers ----
    const employerCounts = jobPositions.reduce(
      (acc, job) => {
        if (!job.company) return acc;
        acc[job.company] = (acc[job.company] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topEmployers = Object.entries(employerCounts)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // ---- Save or return ----
    return this.prisma.orgWeeklyReport.upsert({
      where: { orgID_weekStart: { orgID, weekStart: weekStart.toJSDate() } },
      update: {
        totalAchievements,
        avgAchievementsPerUser,
        topTags,
        topEmployers,
      },
      create: {
        orgID,
        weekStart: weekStart.toJSDate(),
        weekEnd: weekEnd.toJSDate(),
        totalAchievements,
        avgAchievementsPerUser,
        topTags,
        topEmployers,
      },
    });
  }
}
