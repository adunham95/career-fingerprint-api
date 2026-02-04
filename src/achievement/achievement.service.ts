import { Injectable, Logger } from '@nestjs/common';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import {
  mapAchievementUpdateDto,
  UpdateAchievementDto,
} from './dto/update-achievement.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CacheService } from 'src/cache/cache.service';
import { DateTime } from 'luxon';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { normalizeSearchText } from 'src/utils/normaliseKeywords';

@Injectable()
export class AchievementService {
  private readonly logger = new Logger(AchievementService.name);
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    @InjectQueue('goal') private goalQueue: Queue,
  ) {}

  async create(createAchievementDto: CreateAchievementDto) {
    const tags = createAchievementDto?.achievementTags || [];

    delete createAchievementDto.achievementTags;

    const { tokens } = normalizeSearchText(
      `${createAchievementDto.result ?? ''} ${createAchievementDto.myContribution ?? ''}`,
    );

    const newAchievement = await this.prisma.achievement.create({
      data: {
        ...createAchievementDto,
        autoKeyWords: tokens,
        tags: {
          connectOrCreate: tags.map((tagName) => {
            return {
              where: {
                userID_name: {
                  name: tagName,
                  userID: createAchievementDto.userID,
                },
              },
              create: {
                name: tagName,
                userID: createAchievementDto.userID,
                color: 'brand',
              },
            };
          }),
        },
      },
    });

    await this.goalQueue.add('linkToMilestone', {
      userId: createAchievementDto.userID,
      achievementId: newAchievement.id,
    });

    return;
  }

  findAll() {
    return this.prisma.achievement.findMany();
  }

  // TODO pagination
  async findMy(
    userID: number,
    whereOptions: {
      jobPositionID: string | null;
      educationID: string | null;
      tagID: string | null;
      startDate: string | null;
      endDate: string | null;
    },
    includeLinked: boolean = false,
    query?: { page?: number | string; limit?: number | string },
  ) {
    const queryData: {
      skip?: number;
      take?: number;
    } = {};
    if (query?.limit && query.page) {
      let { page, limit } = query;
      page = typeof page === 'string' ? Number(page) : page;
      limit = typeof limit === 'string' ? Number(limit) : limit;
      const skip = (page - 1) * limit;
      queryData.skip = skip;
      queryData.take = limit;
    }

    const where: Prisma.AchievementWhereInput = {};

    this.logger.verbose('Where Options', { whereOptions });

    if (whereOptions.jobPositionID) {
      where.jobPositionID = whereOptions.jobPositionID;
    }

    if (whereOptions.educationID) {
      where.educationID = whereOptions.educationID;
    }

    if (whereOptions.tagID) {
      where.tags = { some: { id: whereOptions.tagID } };
    }
    if (whereOptions.startDate) {
      where.startDate = { gte: new Date(whereOptions.startDate) };
    }

    if (whereOptions.startDate && whereOptions.endDate) {
      where.startDate = {
        gte: new Date(whereOptions.startDate),
        lte: new Date(whereOptions.endDate),
      };
    }

    this.logger.verbose('Where options after added', { where });

    const myAchievements = await this.cache.wrap(
      `myAchievements:${userID}`,
      () => {
        return this.prisma.achievement.findMany({
          ...queryData,
          where: { userID, ...where },
          orderBy: { startDate: 'desc' },
          include: {
            jobPosition: includeLinked && { select: { name: true } },
            education: includeLinked && { select: { institution: true } },
            tags: includeLinked && { select: { name: true, color: true } },
          },
        });
      },
      600,
    );

    return myAchievements;
  }

  findOne(id: string) {
    return this.prisma.achievement.findFirst({ where: { id } });
  }

  update(id: string, updateAchievementDto: UpdateAchievementDto) {
    return this.prisma.achievement.update({
      where: { id },
      data: mapAchievementUpdateDto(updateAchievementDto),
    });
  }

  remove(id: string) {
    return this.prisma.achievement.delete({ where: { id } });
  }

  async getWeeklyStreak(userId: number, timeZone = 'UTC'): Promise<number> {
    const now = DateTime.now().setZone(timeZone);

    // We'll look back 8 weeks for safety margin (can increase if needed)
    const startRange = now.minus({ weeks: 8 }).startOf('week');

    // 1. Fetch all achievements from the past 8 weeks
    const achievements = await this.prisma.achievement.findMany({
      where: {
        userID: userId,
        createdAt: {
          gte: startRange.toJSDate(),
        },
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!achievements.length) return 0;

    // 2. Group achievements by ISO week number + year
    const weeksWithAchievements = new Set<string>();
    for (const { createdAt } of achievements) {
      const week = DateTime.fromJSDate(createdAt).setZone(timeZone);
      const key = `${week.weekYear}-${week.weekNumber}`; // ex: "2025-40"
      weeksWithAchievements.add(key);
    }

    // 3. Walk backward week-by-week from the current week
    let streak = 0;
    for (let i = 0; i < 8; i++) {
      const weekToCheck = now.minus({ weeks: i });
      const key = `${weekToCheck.weekYear}-${weekToCheck.weekNumber}`;
      if (weeksWithAchievements.has(key)) {
        streak++;
      } else {
        break; // Streak ends when a week has no achievements
      }
    }

    return streak;
  }
}
