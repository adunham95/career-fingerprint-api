import { Injectable } from '@nestjs/common';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class EducationService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  create(createEducationDto: CreateEducationDto) {
    return this.prisma.education.create({ data: createEducationDto });
  }

  findAll() {
    return `This action returns all education`;
  }

  findMyEducation(userID: number, options?: { includeAchievements: boolean }) {
    const { includeAchievements = true } = options ?? {};
    return this.prisma.education.findMany({
      where: { userID, status: 'active' },
      include: {
        achievements: includeAchievements,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.education.findFirst({ where: { id } });
  }

  async update(id: string, updateEducationDto: UpdateEducationDto) {
    const { bulletPoints, ...updateEducation } = updateEducationDto;

    if (bulletPoints) {
      for (const bulletPoint of bulletPoints) {
        await this.prisma.bulletPoint.update({
          where: { id: bulletPoint.id },
          data: { text: bulletPoint.text },
        });
      }
    }

    return this.prisma.education.update({
      where: { id },
      data: updateEducation,
    });
  }

  remove(id: string, userID?: number) {
    return this.prisma.education.update({
      where: { id },
      data: {
        status: 'archived',
        archivedAt: new Date(),
        archivedById: userID,
      },
    });
  }
}
