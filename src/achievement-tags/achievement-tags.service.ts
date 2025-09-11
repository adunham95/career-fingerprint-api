import { Injectable } from '@nestjs/common';
import { CreateAchievementTagDto } from './dto/create-achievement-tag.dto';
// import { UpdateAchievementTagDto } from './dto/update-achievement-tag.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { colorList } from './colorList';

@Injectable()
export class AchievementTagsService {
  constructor(private prisma: PrismaService) {}
  create(createAchievementTagDto: CreateAchievementTagDto) {
    if (!createAchievementTagDto.name || createAchievementTagDto.name === '')
      throw Error('Name cannot be empty');
    if (!createAchievementTagDto?.color) {
      createAchievementTagDto.color = this.generateTagColor();
    }
    return this.prisma.achievementTag.create({
      data: { color: 'red', ...createAchievementTagDto },
    });
  }

  findByName(userID: number, queryText: string, limit: number) {
    return this.prisma.achievementTag.findMany({
      where: {
        userID,
        name: {
          contains: queryText,
          mode: 'insensitive',
        },
      },
      take: limit,
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
  }

  findAll(userID: number) {
    return this.prisma.achievementTag.findMany({
      where: {
        userID,
      },
      select: { id: true, name: true },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} achievementTag`;
  }

  update(id: number) {
    return `This action updates a #${id} achievementTag`;
  }
  // update(id: number, updateAchievementTagDto: UpdateAchievementTagDto) {
  //   return `This action updates a #${id} achievementTag`;
  // }

  linkToAchievementID(id: string, achievementID: string) {
    return this.prisma.achievementTag.update({
      where: { id },
      data: {
        achievements: {
          connect: { id: achievementID },
        },
      },
    });
  }

  linkToAchievement(name: string, userID: number, achievementID: string) {
    return this.prisma.achievementTag.update({
      where: { userID_name: { name, userID } },
      data: {
        achievements: {
          connect: { id: achievementID },
        },
      },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} achievementTag`;
  }

  generateTagColor() {
    const randomIndex = Math.floor(Math.random() * colorList.length);
    return colorList[randomIndex];
  }
}
