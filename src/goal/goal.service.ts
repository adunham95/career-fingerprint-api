import { Evidence } from './../../node_modules/.prisma/client/index.d';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGoalDto, CreateMilestonesDto } from './dto/create-goal.dto';
import { CheckoffMilestoneDto, UpdateGoalDto } from './dto/update-goal.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CacheService } from 'src/cache/cache.service';
import {
  Achievement,
  Goal,
  MilestoneKind,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { SseService } from 'src/sse/sse.service';
import { MailService } from 'src/mail/mail.service';

type PrismaLike = PrismaClient | Prisma.TransactionClient;
@Injectable()
export class GoalService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private sse: SseService,
    private mailService: MailService,
  ) {}
  create(createGoalDto: CreateGoalDto) {
    const { userID, templateKey, title, description, milestones } =
      createGoalDto;

    const milestoneCreates: Prisma.GoalMilestoneCreateWithoutGoalInput[] =
      milestones.map((m: CreateMilestonesDto, idx: number) => {
        const kind = this.toKind(m.type);
        const metricConfig = this.buildMetricConfig(kind, m);
        const checklistItems =
          kind === 'checklist'
            ? {
                create: (m.checklist ?? []).filter(Boolean).map((label, i) => ({
                  order: i,
                  label: String(label).trim(),
                  key: this.slug(`${i + 1}-${label}`),
                })),
              }
            : undefined;

        let targetCount = 0;
        switch (kind) {
          case MilestoneKind.checklist:
            targetCount = m.checklist.length;
            break;
          case MilestoneKind.manual:
            targetCount = 1;
            break;
          case MilestoneKind.streak:
            targetCount = m.streak;
            break;
          default:
            targetCount = m.targetCount;
            break;
        }

        return {
          order: idx,
          title: (m.title ?? '').trim() || `Milestone ${idx + 1}`,
          kind,
          metricConfig,
          targetCount,
          ...(checklistItems ? { checklistItems } : {}),
        };
      });

    return this.prisma.goal.create({
      data: {
        userID,
        templateKey: templateKey ?? null,
        title: title.trim(),
        description: description ?? null,
        milestones: {
          create: milestoneCreates,
        },
      },
    });
  }

  private buildMetricConfig(
    kind: MilestoneKind,
    m: CreateMilestonesDto,
  ): Prisma.JsonObject {
    switch (kind) {
      case MilestoneKind.manual:
        return {};

      case MilestoneKind.checklist: {
        return {};
      }

      case MilestoneKind.keywords_tags: {
        const keywords = (m.keywords ?? [])
          .filter(Boolean)
          .map((k) => String(k).trim());
        const targetCount = Number.isFinite(m.targetCount)
          ? Number(m.targetCount)
          : 0;

        // dto doesn't currently have tags; store an empty array for forward-compat
        return { targetCount, keywords, tags: [] };
      }

      case MilestoneKind.streak: {
        // Your schema comment says { timesPerWeek, weeks }
        // DTO currently only has `streak` (number). We'll interpret it as `weeks`.
        const weeks = Number.isFinite(m.streak) ? Number(m.streak) : 0;

        // No field for timesPerWeek in DTO yet, so default to 1.
        return { timesPerWeek: 1, weeks };
      }

      default:
        return {};
    }
  }

  findAll() {
    return `This action returns all goal`;
  }

  async findMine(
    userID: number,
    query?: {
      page?: number;
      limit?: number;
      active?: boolean;
      showProgress?: boolean;
    },
  ) {
    const queryData: {
      skip?: number;
      take?: number;
    } = {};
    if (query?.limit && query.page) {
      const { page, limit } = query;
      const skip = (page - 1) * limit;
      queryData.skip = skip;
      queryData.take = limit;
    }
    const where: Prisma.GoalWhereInput = {
      userID,
    };

    if (query?.active) {
      where.status = 'active';
    }

    const data = await this.prisma.goal.findMany({
      ...queryData,
      where,
      include: {
        milestones: {
          include: {
            checklistItems: { select: { key: true, label: true, order: true } },
          },
        },
      },
    });

    return data;
  }

  async getMilestoneDetails(type: string, milestoneID: string) {
    const kind = this.toKind(type);

    switch (kind) {
      case MilestoneKind.checklist: {
        const checklistItems =
          await this.prisma.goalMilestoneChecklistItem.findMany({
            where: { milestoneID },
            orderBy: { order: 'asc' },
          });

        return {
          checklistItems,
        };
      }

      case MilestoneKind.manual: {
        const manualItem = await this.prisma.goalMilestoneManualState.findFirst(
          {
            where: { milestoneID },
          },
        );
        if (!manualItem) {
          return { setUp: false };
        }
        return manualItem;
      }

      default:
        return {};
    }
  }

  async checkoffMilestone(
    type: string,
    milestoneID: string,
    userID: number,
    body: CheckoffMilestoneDto,
  ) {
    const kind = this.toKind(type);

    const newData = await this.prisma.$transaction(async (tx) => {
      const milestone = await tx.goalMilestone.findUnique({
        where: { id: milestoneID },
        select: { id: true, kind: true },
      });

      if (!milestone) throw new NotFoundException('Milestone not found');
      switch (kind) {
        case MilestoneKind.checklist: {
          return this.checkoffChecklistItem(
            {
              milestoneID,
              key: body.key,
              userID,
              checked: body.checked,
            },
            tx,
          );
        }

        case MilestoneKind.manual: {
          return this.checkoffManualItem(
            {
              milestoneID,
              userID,
              checked: body.checked,
            },
            tx,
          );
        }

        default:
          throw new BadRequestException(
            `Checkoff not supported for milestone kind: ${type}`,
          );
      }
    });

    console.log(newData);

    const milestoneDetails = await this.prisma.goalMilestone.findFirst({
      where: { id: milestoneID },
    });

    if (!milestoneDetails) throw new NotFoundException('Milestone not found');

    const currentProgress = await this.updateMilestoneProgress(milestoneID);

    return {
      currentProgress,
      details: { goalID: milestoneDetails.goalID, id: milestoneDetails.id },
    };
  }

  private async checkoffChecklistItem(
    args: {
      milestoneID: string;
      key?: string;
      userID: number;
      checked: boolean;
    },
    db?: PrismaLike,
  ) {
    const { milestoneID, key, userID, checked } = args;

    if (!db) {
      db = this.prisma;
    }

    if (!key) {
      console.log('Missing Key');
      throw new NotFoundException('Checklist item not found');
    }

    const existing = await db.goalMilestoneChecklistItem.findUnique({
      where: { milestoneID_key: { milestoneID, key } },
      select: { checked: true, milestoneID: true, label: true },
    });

    if (!existing) throw new NotFoundException('Checklist item not found');

    const updatedItem = await db.goalMilestoneChecklistItem.update({
      where: { milestoneID_key: { milestoneID, key } },
      data: { checked },
    });

    await this.createEvidence(
      { itemKey: key, label: existing.label, checked },
      'checklist_toggle',
      milestoneID,
      userID,
      db,
    );

    return updatedItem;
  }

  private async checkoffManualItem(
    args: { milestoneID: string; userID: number; checked: boolean },
    db?: PrismaLike,
  ) {
    if (!db) {
      db = this.prisma;
    }

    const { milestoneID, userID, checked } = args;

    const updatedItem = await db.goalMilestoneManualState.upsert({
      where: { milestoneID_userID: { milestoneID, userID } },
      create: { userID, milestoneID, checked },
      update: { checked },
    });

    await this.createEvidence(
      { itemKey: updatedItem.id, checked },
      'manual',
      milestoneID,
      userID,
      db,
    );

    return updatedItem;
  }

  private async createEvidence(
    data: { [key: string]: any },
    kind: string,
    milestoneID: string,
    userID: number,
    db: PrismaLike,
  ) {
    if (!db) {
      db = this.prisma;
    }
    await db.evidence.create({
      data: {
        userID,
        milestoneID,
        kind: this.toKind(kind),
        occurredAt: new Date(),
        data: data,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} goal`;
  }

  update(id: number, updateGoalDto: UpdateGoalDto) {
    return `This action updates a #${id} goal`;
  }

  remove(id: number) {
    return `This action removes a #${id} goal`;
  }

  findGoalSkills() {
    return [];
  }

  async updateMilestoneProgress(milestoneID: string, db?: PrismaLike) {
    if (!db) {
      db = this.prisma;
    }
    const milestone = await db.goalMilestone.findUnique({
      where: { id: milestoneID },
      include: {
        checklistItems: true,
      },
    });

    if (!milestone) throw new Error('Milestone not found');

    switch (milestone.kind) {
      case MilestoneKind.checklist: {
        const total = milestone.checklistItems.length;
        const checked = milestone.checklistItems.filter(
          (c) => c.checked,
        ).length;

        return {
          progress: checked,
          targetCount: total,
        };
      }

      case MilestoneKind.manual: {
        // simplest: a manual milestone is "done" if it has a checkoff evidence with checked=true
        const last = await db.goalMilestoneManualState.findFirst({
          where: { milestoneID },
        });

        const checked = Boolean(last?.checked ?? true); // default true if you don't store it
        const progress = checked ? 1 : 0;

        return {
          progress,
          targetCount: 1,
        };
      }

      case MilestoneKind.keywords_tags: {
        // metricConfig: { targetCount: number, keywords: string[], tags: string[] }
        const targetCount = Number(milestone.targetCount ?? 0);

        // Count “matching” evidence items. This assumes evidence.data can store { keywords: [], tags: [] }
        // Or if you attach achievements, you can join to Achievement and match there.
        const matching = await db.evidence.count({
          where: {
            milestoneID,
            kind: MilestoneKind.keywords_tags,
            achievementID: { not: null },
          },
        });

        const progress = Math.min(matching, targetCount || matching);

        return {
          progress,
          targetCount,
        };
      }

      case MilestoneKind.streak: {
        const weeks = Number(milestone.targetCount ?? 0);
        if (!weeks) return { progress: 0, targetCount: 0, completedAt: null };

        const checkIns = await db.goalMilestoneStreakCheckIn.findMany({
          where: {
            milestoneID,
          },
          select: { weekStart: true },
          orderBy: { weekStart: 'asc' },
        });

        if (checkIns.length === 0) {
          return { progress: 0, targetCount: weeks, completedAt: null };
        }

        // weekStart should be the FRIDAY date (normalized) for each checkin
        // Dedup by weekStart just in case (should already be unique per user/weekStart)
        const weekStarts = Array.from(
          new Set(checkIns.map((c) => c.weekStart.getTime())),
        )
          .sort((a, b) => a - b)
          .map((t) => new Date(t));

        const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

        // Streak = consecutive Fridays ending at the latest recorded Friday
        let streak = 1;
        for (let i = weekStarts.length - 1; i > 0; i--) {
          const cur = weekStarts[i].getTime();
          const prev = weekStarts[i - 1].getTime();

          if (cur - prev === ONE_WEEK_MS) streak++;
          else break;
        }

        const progress = Math.min(streak, weeks);

        return {
          progress,
          targetCount: weeks,
        };
      }

      default:
        return {
          progress: 0,
          targetCount: 0,
        };
    }
  }

  async calculateGoalProgress(goal: Goal) {
    return 0;
    // Fetch achievements since the goal was created
    // const achievements = await this.prisma.achievement.findMany({
    //   where: {
    //     userID: goal.userID,
    //     createdAt: { gte: goal.createdAt },
    //   },
    //   include: {
    //     tags: { select: { name: true } },
    //   },
    // });

    // // Calculate total weighted points
    // let totalPoints = 0;
    // for (const achievement of achievements) {
    //   totalPoints += this.calculateAchievementPoints(goal, achievement);
    // }

    // const target = goal.targetCount ?? 0;

    // let progress = 0;
    // if (target > 0) {
    //   progress = totalPoints / target;
    // }

    // // Optional: cap progress at 100%
    // progress = Math.min(progress, 1);

    // return progress;
  }

  calculateAchievementPoints(goal: Goal, achievement: Achievement): number {
    return 0;
    // const text =
    //   `${achievement.result ?? ''} ${achievement.myContribution ?? ''}`.toLowerCase();
    // let score = 0;
    // // --- KEYWORD SCORING ---
    // const keywordMatches = goal.keywords.filter((k) =>
    //   text.includes(k.toLowerCase()),
    // ).length;
    // const keywordMatchCount = Math.min(keywordMatches, 5); // cap at 3
    // console.log('keyword score', {
    //   score: keywordMatchCount * 0.25,
    //   keywordMatchCount,
    // });
    // score += keywordMatchCount * 0.25; // weighted
    // // --- ACTION SCORING ---
    // const actionMatches = goal.actions.filter((a) =>
    //   text.includes(a.toLowerCase()),
    // ).length;
    // console.log('action score', {
    //   score: actionMatches * 1,
    //   actionMatches,
    // });
    // score += actionMatches * 1; // weighted (full point per action)
    // console.log('total score', score);
    // return score;
  }

  async completeGoal(goalID: string) {
    // console.log('goal complete');
    // const goal = await this.prisma.goal.findFirst({
    //   where: { id: goalID },
    //   include: {
    //     user: true,
    //     linkedAchievements: {
    //       orderBy: { createdAt: 'desc' },
    //       take: 5,
    //     },
    //   },
    // });
    // if (goal?.userID) {
    //   this.sse.emitToUser(goal.userID, {
    //     type: 'success',
    //     message: `You Completed Your Goal: ${goal.name}`,
    //   });
    // }
    // if (goal?.user) {
    //   await this.mailService.sendGoalComplete({
    //     to: goal.user.email,
    //     context: {
    //       firstName: goal.user.firstName,
    //       goalName: goal.name,
    //       recentAchievements: goal.linkedAchievements
    //         .filter((a) => a.myContribution !== null)
    //         .map((a) => {
    //           return a.myContribution || '';
    //         }),
    //     },
    //   });
    // }
    // return this.prisma.goal.update({
    //   where: { id: goalID },
    //   data: { status: 'complete', completedAt: new Date(), progress: 1 },
    // });
  }

  private slug(input: string): string {
    return String(input)
      .toLowerCase()
      .trim()
      .replace(/['"]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 64);
  }

  private toKind(type?: string): MilestoneKind {
    const t = (type ?? '').toLowerCase().trim();
    if (t === 'manual') return MilestoneKind.manual;
    if (t === 'manuel') return MilestoneKind.manual;
    if (t === 'checklist') return MilestoneKind.checklist;
    if (t === 'keywords_tags' || t === 'keywords' || t === 'keyword_tags')
      return MilestoneKind.keywords_tags;
    if (t === 'streak') return MilestoneKind.streak;
    return MilestoneKind.manual;
  }
}
