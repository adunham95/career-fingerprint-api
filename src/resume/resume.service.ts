import { Injectable } from '@nestjs/common';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ResumeService {
  constructor(private prisma: PrismaService) {}
  create(createResumeDto: CreateResumeDto) {
    return this.prisma.resume.create({ data: createResumeDto });
  }

  findAll() {
    return `This action returns all resume`;
  }

  findMyResumes(userID: number) {
    return this.prisma.resume.findMany({ where: { userID } });
  }

  findOne(id: string) {
    return this.prisma.resume.findFirst({ where: { id } });
  }

  update(id: string, updateResumeDto: UpdateResumeDto) {
    return this.prisma.resume.update({ where: { id }, data: updateResumeDto });
  }

  remove(id: string) {
    return this.prisma.resume.delete({ where: { id } });
  }
}
