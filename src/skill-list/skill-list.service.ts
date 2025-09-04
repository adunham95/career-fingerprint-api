import { Injectable } from '@nestjs/common';
import { CacheService } from 'src/cache/cache.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SkillListService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async mySkillList(userID: number) {
    const skillList = await this.cache.wrap(`skillList:${userID}`, async () => {
      const skillList = await this.prisma.skills.findFirst({
        where: { userID },
      });
      if (skillList) {
        return skillList;
      }
      return null;
    });
    console.log({ skillList });
    return skillList;
  }

  async upsertSkillList(userID: number, skillList: string[]) {
    await this.cache.del(`skillList:${userID}`);
    return this.prisma.skills.upsert({
      where: { userID },
      update: {
        skillList,
      },
      create: {
        userID,
        skillList,
      },
    });
  }
}
