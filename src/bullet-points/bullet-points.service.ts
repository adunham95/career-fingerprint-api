import { Injectable } from '@nestjs/common';
import { CreateBulletPointDto } from './dto/create-bullet-point.dto';
import { UpdateBulletPointDto } from './dto/update-bullet-point.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BulletPointsService {
  constructor(private prisma: PrismaService) {}
  create(createBulletPointDto: CreateBulletPointDto) {
    return this.prisma.bulletPoint.create({ data: createBulletPointDto });
  }

  update(id: string, updateBulletPointDto: UpdateBulletPointDto) {
    return this.prisma.bulletPoint.update({
      where: { id },
      data: updateBulletPointDto,
    });
  }

  remove(id: string) {
    return this.prisma.bulletPoint.delete({ where: { id } });
  }
}
