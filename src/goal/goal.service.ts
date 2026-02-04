import { DateTime } from 'luxon';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGoalDto, CreateMilestonesDto } from './dto/create-goal.dto';
import { CheckoffMilestoneDto, UpdateGoalDto } from './dto/update-goal.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CacheService } from 'src/cache/cache.service';
import { MilestoneKind, Prisma, PrismaClient } from '@prisma/client';
import { SseService } from 'src/sse/sse.service';
import { MailService } from 'src/mail/mail.service';
import { startOfWeek, weekStartETJS } from 'src/utils/weekStart';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

type PrismaLike = PrismaClient | Prisma.TransactionClient;
@Injectable()
export class GoalService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private sse: SseService,
    private mailService: MailService,
    @InjectQueue('goal') private goalQueue: Queue,
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
          userID,
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
      orderBy: {
        createdAt: 'asc',
      },
    });

    return data;
  }

  async getMilestoneDetails(
    type: string,
    milestoneID: string,
    userID: number,
    userTimeZone?: string,
  ) {
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

      case MilestoneKind.keywords_tags: {
        const linkedAchievements = await this.prisma.evidence.findMany({
          where: {
            milestoneID,
            kind: MilestoneKind.keywords_tags,
            achievementID: { not: null },
          },
          include: { achievement: true },
        });
        return { linkedAchievements };
      }

      case MilestoneKind.streak: {
        const thisWeekStart = weekStartETJS(new Date(), userTimeZone);

        const [latest, thisWeek, milestone] = await this.prisma.$transaction([
          this.prisma.goalMilestoneStreakCheckIn.findFirst({
            where: { milestoneID, userID },
            orderBy: { occurredAt: 'desc' },
          }),

          this.prisma.goalMilestoneStreakCheckIn.findUnique({
            where: {
              milestoneID_userID_weekStart: {
                milestoneID,
                userID,
                weekStart: thisWeekStart,
              },
            },
          }),

          this.prisma.goalMilestone.findFirst({
            where: {
              id: milestoneID,
            },
            select: { progress: true },
          }),
        ]);

        return {
          streak: {
            currentStreak: milestone?.progress || 0,
            hasCheckInThisWeek: Boolean(thisWeek),
            lastCheckIn: latest?.occurredAt ?? null,
          },
        };
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

    const milestoneDetails = await this.cache.wrap(
      `mileStoneGoal:${milestoneID}`,
      () => {
        return this.prisma.goalMilestone.findFirst({
          where: { id: milestoneID },
          select: { id: true, goalID: true, kind: true },
        });
      },
      86400,
    );

    if (!milestoneDetails) throw new NotFoundException('Milestone not found');

    const newData = await this.prisma.$transaction(async (tx) => {
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

        case MilestoneKind.streak: {
          return this.checkStreakThisWeek({ milestoneID, userID }, tx);
        }

        default:
          throw new BadRequestException(
            `Checkoff not supported for milestone kind: ${type}`,
          );
      }
    });

    console.log(newData);

    const { goalProgress, milestoneProgress } =
      await this.updateMilestoneProgress(milestoneID);

    return {
      goalProgress,
      milestoneProgress,
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

  private async checkStreakThisWeek(
    args: { milestoneID: string; userID: number },
    db?: PrismaLike,
  ) {
    const prisma = db ?? this.prisma;
    const { milestoneID, userID } = args;

    const now = new Date();
    const weekStart = weekStartETJS(now);

    const checkIn = await prisma.goalMilestoneStreakCheckIn.upsert({
      where: {
        milestoneID_userID_weekStart: {
          milestoneID,
          userID,
          weekStart,
        },
      },
      create: {
        milestoneID,
        userID,
        weekStart,
        occurredAt: now,
      },
      update: {
        // optional: refresh timestamp if they "check" again
        occurredAt: now,
      },
    });

    const weekKey = DateTime.fromJSDate(weekStart, {
      zone: 'utc',
    }).toISODate();

    return {
      checkIn,
      hasCheckInThisWeek: true,
      weekStart,
      key: `week_${weekKey}`,
    };
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

  async calculateMilestoneProgress(milestoneID: string, db?: PrismaLike) {
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
          complete: checked === total,
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
          complete: progress === 1,
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
          complete: progress === targetCount,
        };
      }

      case MilestoneKind.streak: {
        const { streak, weeks } = await this.calculateStreak(milestoneID, db);

        const progress = Math.min(streak, weeks);

        return {
          progress,
          targetCount: weeks,
          complete: progress === weeks,
        };
      }

      default:
        return {
          progress: 0,
          targetCount: 0,
          complete: false,
        };
    }
  }

  async calculateGoalProgress(goalID: string, db?: PrismaLike) {
    if (!db) {
      db = this.prisma;
    }
    const goal = await db.goal.findUnique({
      where: { id: goalID },
      include: {
        milestones: { select: { progress: true, targetCount: true } },
      },
    });

    let totalProgress = 0;
    let targetPoints = 0;

    goal?.milestones.forEach((element) => {
      const { progress, targetCount } = element;
      targetPoints += targetCount;
      totalProgress += progress;
    });

    let progress = totalProgress / targetPoints;

    progress = Math.min(progress, 1);

    return Math.round(progress * 100);
  }

  async calculateStreak(milestoneID: string, db?: PrismaLike) {
    if (!db) {
      db = this.prisma;
    }
    const milestone = await db.goalMilestone.findUnique({
      where: { id: milestoneID },
      include: {
        checklistItems: true,
      },
    });
    if (!milestone) {
      return { streak: 0, weeks: 0 };
    }
    const weeks = Number(milestone.targetCount ?? 0);
    if (!weeks) return { streak: 0, weeks: 0 };

    const checkIns = await db.goalMilestoneStreakCheckIn.findMany({
      where: {
        milestoneID,
      },
      select: { weekStart: true },
      orderBy: { weekStart: 'asc' },
    });

    if (checkIns.length === 0) {
      return { streak: 0, weeks: 0 };
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

    return { streak: streak || 0, weeks };
  }

  async resetStreakCounter() {
    const weekStart = startOfWeek();

    const milestonesToReset = await this.prisma.goalMilestone.findMany({
      where: {
        kind: 'streak',
        completedAt: null,
        NOT: {
          GoalMilestoneStreakCheckIn: {
            some: {
              weekStart,
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!milestonesToReset.length) return;

    const ids = milestonesToReset.map((m) => m.id);

    for (let i = 0; i < ids.length; i++) {
      const milestoneID = ids[i];
      await this.goalQueue.add('updateMilestoneProgress', {
        milestoneID,
      });
    }
  }

  async updateMilestoneProgress(milestoneID: string) {
    const milestoneDetails = await this.cache.wrap(
      `mileStoneGoal:${milestoneID}`,
      () => {
        return this.prisma.goalMilestone.findFirst({
          where: { id: milestoneID },
          select: { id: true, goalID: true, kind: true },
        });
      },
      86400,
    );

    if (!milestoneDetails) {
      return {
        goalProgress: 0,
        milestoneProgress: { targetCount: 0, progress: 0 },
      };
    }

    const milestoneProgress =
      await this.calculateMilestoneProgress(milestoneID);

    await this.prisma.goalMilestone.update({
      where: {
        id: milestoneID,
      },
      data: {
        targetCount: milestoneProgress.targetCount,
        progress: milestoneProgress.progress,
        completedAt: milestoneProgress.complete ? new Date() : null,
      },
    });

    const goalProgress = await this.calculateGoalProgress(
      milestoneDetails.goalID,
    );

    await this.prisma.goal.update({
      where: { id: milestoneDetails.goalID },
      data: { progress: goalProgress },
    });

    if (goalProgress >= 100) {
      await this.goalQueue.add('closeGoal', {
        goalID: milestoneDetails.goalID,
      });
    }

    return { goalProgress, milestoneProgress };
  }

  async updateGoalProgress(goalID: string) {
    const goalDetails = await this.prisma.goal.findFirst({
      where: { id: goalID },
      select: { id: true, milestones: { select: { id: true } } },
    });

    if (!goalDetails) {
      return {
        goalProgress: 0,
      };
    }

    for (let i = 0; i < goalDetails.milestones.length; i++) {
      const element = goalDetails.milestones[i];
      const milestoneProgress = await this.calculateMilestoneProgress(
        element.id,
      );

      await this.prisma.goalMilestone.update({
        where: {
          id: element.id,
        },
        data: {
          targetCount: milestoneProgress.targetCount,
          progress: milestoneProgress.progress,
          completedAt: milestoneProgress.complete ? new Date() : null,
        },
      });
    }

    const goalProgress = await this.calculateGoalProgress(goalID);

    await this.prisma.goal.update({
      where: { id: goalID },
      data: { progress: goalProgress },
    });

    if (goalProgress >= 100) {
      await this.goalQueue.add('closeGoal', {
        goalID: goalID,
      });
    }

    return { goalProgress };
  }

  async completeGoal(goalID: string) {
    console.log('goal complete');
    await this.prisma.goal.update({
      where: { id: goalID },
      data: { status: 'completed', completedAt: new Date() },
    });
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
