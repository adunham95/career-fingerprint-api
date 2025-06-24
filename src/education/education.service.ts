import { Injectable } from '@nestjs/common';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EducationService {
  constructor(private prisma: PrismaService) {}

  create(createEducationDto: CreateEducationDto) {
    return this.prisma.education.create({ data: createEducationDto });
  }

  findAll() {
    return `This action returns all education`;
  }

  findMyEducation(userID: number) {
    return this.prisma.education.findMany({ where: { userID } });
  }

  findOne(id: string) {
    return this.prisma.education.findFirst({ where: { id } });
  }

  update(id: string, updateEducationDto: UpdateEducationDto) {
    return this.prisma.education.update({
      where: { id },
      data: updateEducationDto,
    });
  }

  remove(id: string) {
    return this.prisma.education.delete({ where: { id } });
  }
}
