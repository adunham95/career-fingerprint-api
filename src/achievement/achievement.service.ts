import { Injectable } from '@nestjs/common';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class AchievementService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  create(createAchievementDto: CreateAchievementDto) {
    const tags = createAchievementDto?.achievementTags || [];

    delete createAchievementDto.achievementTags;

    return this.prisma.achievement.create({
      data: {
        ...createAchievementDto,
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
  }

  findAll() {
    return this.prisma.achievement.findMany();
  }

  // TODO pagination
  async findMy(
    userID: number,
    whereOptions: { jobPositionID: string | null; educationID: string | null },
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

    console.log({ whereOptions });

    if (whereOptions.jobPositionID) {
      where.jobPositionID = whereOptions.jobPositionID;
    }

    if (whereOptions.educationID) {
      where.educationID = whereOptions.educationID;
    }

    console.log({ where });

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
      data: updateAchievementDto,
    });
  }

  remove(id: string) {
    return this.prisma.achievement.delete({ where: { id } });
  }
}
