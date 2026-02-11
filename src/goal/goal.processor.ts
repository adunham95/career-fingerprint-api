import { CacheService } from './../cache/cache.service';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { GoalService } from './goal.service';
import { Job, Queue } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';
import { MilestoneKind } from '@prisma/client';

@Processor('goal')
export class GoalProcessor {
  constructor(
    private readonly goalService: GoalService,
    private readonly cache: CacheService,
    private readonly prisma: PrismaService,
    @InjectQueue('goal') private goalQueue: Queue,
  ) {}

  @Process('closeGoal')
  async closeGoal(
    job: Job<{
      goalID: string;
    }>,
  ) {
    console.log('running closeGoal');
    const { goalID } = job.data;

    await this.goalService.completeGoal(goalID);
  }

  @Process('updateGoalProgress')
  async updateGoalProgress(
    job: Job<{
      goalID: string;
    }>,
  ) {
    console.log('running recalculateGoalProgress');
    const { goalID } = job.data;

    await this.goalService.updateGoalProgress(goalID);
  }

  @Process('updateMilestoneProgress')
  async updateMilestoneProgress(
    job: Job<{
      milestoneID: string;
    }>,
  ) {
    console.log('running recalculateGoalProgress');
    const { milestoneID } = job.data;

    await this.goalService.updateMilestoneProgress(milestoneID);
  }

  @Process('linkToMilestone')
  async linkAchievementToMilestone(
    job: Job<{
      userId: number;
      achievementId: string;
    }>,
  ) {
    console.log('running linkToMilestone');
    const { userId, achievementId } = job.data;

    const achievement = await this.prisma.achievement.findUnique({
      where: { id: achievementId },
      select: { id: true, userID: true, autoKeyWords: true },
    });

    if (!achievement || achievement.userID !== userId) return;

    const kws = achievement?.autoKeyWords ?? [];
    if (!kws?.length) return;

    const achievementKeyWords = new Set(kws);

    const milestones = await this.getKeywordMilestonesForUser(userId);

    const links: Array<{ milestoneID: string; matchReason: string }> = [];

    for (const m of milestones) {
      let first: string | null = null;
      for (const k of m.keywords) {
        if (achievementKeyWords.has(k)) {
          first = k;
          break;
        }
      }
      if (first) {
        links.push({
          milestoneID: m.id,
          matchReason: `keyword:${first}`,
        });
        await this.goalQueue.add('updateGoalProgress', {
          goalID: m.goalID,
        });
      }
    }

    if (!links.length) return;

    await this.prisma.evidence.createMany({
      data: links.map((l) => ({
        userID: userId,
        milestoneID: l.milestoneID,
        achievementID: achievementId,
        kind: MilestoneKind.keywords_tags,
        linkType: 'auto',
        matchReason: l.matchReason,
      })),
      skipDuplicates: true,
    });
  }

  async getKeywordMilestonesForUser(userId: number) {
    // try cache first
    const cached = await this.cache.get(`kwMilestones:${userId}`);
    if (cached)
      return cached as Array<{
        id: string;
        keywords: string[];
        goalID: string;
      }>;

    const rows = await this.prisma.goalMilestone.findMany({
      where: {
        userID: userId,
        kind: 'keywords_tags',
        goal: { status: 'active' },
      },
      select: { id: true, metricConfig: true, goalID: true },
    });

    const mapped = rows
      .map((r) => {
        const raw = ((r.metricConfig as { keywords: string[] })?.keywords ??
          []) as unknown[];
        const seen = new Set<string>();
        const keywords = raw
          .map((k) => String(k).trim().toLowerCase())
          .filter(Boolean)
          .filter((k) => (seen.has(k) ? false : (seen.add(k), true)));

        return { id: r.id, keywords, goalID: r.goalID };
      })
      .filter((r) => r.keywords.length);

    await this.cache.set(`kwMilestones:${userId}`, mapped, 60 * 10);
    return mapped;
  }
}
