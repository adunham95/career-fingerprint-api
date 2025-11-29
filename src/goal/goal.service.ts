import { Injectable } from '@nestjs/common';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CacheService } from 'src/cache/cache.service';
import { Achievement, Goal, Prisma } from '@prisma/client';
import { SseService } from 'src/sse/sse.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class GoalService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private sse: SseService,
    private mailService: MailService,
  ) {}
  create(createGoalDto: CreateGoalDto) {
    return this.prisma.goal.create({
      data: {
        name: createGoalDto.name,
        userID: createGoalDto.userID,
        actions: createGoalDto.actions,
        keywords: createGoalDto.keywords,
        targetCount: createGoalDto.targetCount,
      },
    });
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

    console.log(query?.active);

    if (query?.active) {
      where.status = 'active';
    }

    const data = await this.prisma.goal.findMany({
      ...queryData,
      where,
    });

    return data;
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

  async findGoalSkills() {
    const goalSkills = await this.cache.wrap(
      `goalSkills`,
      () => {
        return this.prisma.goalSkill.findMany({ orderBy: { name: 'asc' } });
      },
      86400,
    );

    return goalSkills;
  }

  async calculateGoalProgress(goal: Goal) {
    // Fetch achievements since the goal was created
    const achievements = await this.prisma.achievement.findMany({
      where: {
        userID: goal.userID,
        createdAt: { gte: goal.createdAt },
      },
      include: {
        tags: { select: { name: true } },
      },
    });

    // Calculate total weighted points
    let totalPoints = 0;
    for (const achievement of achievements) {
      totalPoints += this.calculateAchievementPoints(goal, achievement);
    }

    const target = goal.targetCount ?? 0;

    let progress = 0;
    if (target > 0) {
      progress = totalPoints / target;
    }

    // Optional: cap progress at 100%
    progress = Math.min(progress, 1);

    return progress;
  }

  calculateAchievementPoints(goal: Goal, achievement: Achievement): number {
    const text =
      `${achievement.result ?? ''} ${achievement.myContribution ?? ''}`.toLowerCase();

    let score = 0;

    // --- KEYWORD SCORING ---
    const keywordMatches = goal.keywords.filter((k) =>
      text.includes(k.toLowerCase()),
    ).length;

    const keywordMatchCount = Math.min(keywordMatches, 5); // cap at 3
    console.log('keyword score', {
      score: keywordMatchCount * 0.25,
      keywordMatchCount,
    });
    score += keywordMatchCount * 0.25; // weighted

    // --- ACTION SCORING ---
    const actionMatches = goal.actions.filter((a) =>
      text.includes(a.toLowerCase()),
    ).length;
    console.log('action score', {
      score: actionMatches * 1,
      actionMatches,
    });
    score += actionMatches * 1; // weighted (full point per action)

    console.log('total score', score);
    return score;
  }

  async completeGoal(goalID: string) {
    console.log('goal complete');
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalID },
      include: {
        user: true,
        linkedAchievements: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (goal?.userID) {
      this.sse.emitToUser(goal.userID, {
        type: 'success',
        message: `You Completed Your Goal: ${goal.name}`,
      });
    }
    if (goal?.user) {
      await this.mailService.sendGoalComplete({
        to: goal.user.email,
        context: {
          firstName: goal.user.firstName,
          goalName: goal.name,
          recentAchievements: goal.linkedAchievements
            .filter((a) => a.myContribution !== null)
            .map((a) => {
              return a.myContribution || '';
            }),
        },
      });
    }

    return this.prisma.goal.update({
      where: { id: goalID },
      data: { status: 'complete', completedAt: new Date(), progress: 1 },
    });
  }
}
