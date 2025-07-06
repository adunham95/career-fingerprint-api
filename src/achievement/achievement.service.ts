import { Injectable } from '@nestjs/common';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AchievementService {
  constructor(private prisma: PrismaService) {}

  create(createAchievementDto: CreateAchievementDto) {
    return this.prisma.achievement.create({ data: createAchievementDto });
  }

  findAll() {
    return this.prisma.achievement.findMany();
  }

  // TODO pagination
  findMy(userID: number) {
    return this.prisma.achievement.findMany({
      where: { userID },
      orderBy: { startDate: 'desc' },
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
