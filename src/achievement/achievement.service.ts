import { Injectable } from '@nestjs/common';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AchievementService {
  constructor(private prisma: PrismaService) {}

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
  findMy(userID: number, includeLinked: boolean = false) {
    return this.prisma.achievement.findMany({
      where: { userID },
      orderBy: { startDate: 'desc' },
      include: {
        jobPosition: includeLinked && { select: { name: true } },
        education: includeLinked && { select: { institution: true } },
        tags: includeLinked && { select: { name: true, color: true } },
      },
    });
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
