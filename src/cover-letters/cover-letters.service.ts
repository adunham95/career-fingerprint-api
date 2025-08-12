import { Injectable } from '@nestjs/common';
import { CreateCoverLetterDto } from './dto/create-cover-letter.dto';
import { UpdateCoverLetterDto } from './dto/update-cover-letter.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CoverLettersService {
  constructor(private prisma: PrismaService) {}
  create(createCoverLetterDto: CreateCoverLetterDto) {
    return this.prisma.coverLetter.create({ data: createCoverLetterDto });
  }

  upsert(jobAppID: string, createCoverLetterDto: CreateCoverLetterDto) {
    return this.prisma.coverLetter.upsert({
      where: { jobAppID },
      create: createCoverLetterDto,
      update: createCoverLetterDto,
    });
  }

  findAll() {
    return `This action returns all coverLetters`;
  }

  findMine(userID: number) {
    return this.prisma.coverLetter.findMany({ where: { userID } });
  }

  findOne(id: string) {
    return this.prisma.coverLetter.findFirst({ where: { id } });
  }

  findOneFromJob(jobAppID: string) {
    return this.prisma.coverLetter.findFirst({
      where: { jobAppID },
      select: { id: true, message: true, to: true },
    });
  }

  update(id: string, updateCoverLetterDto: UpdateCoverLetterDto) {
    return this.prisma.coverLetter.update({
      where: { id },
      data: updateCoverLetterDto,
    });
  }

  remove(id: string) {
    return this.prisma.coverLetter.delete({ where: { id } });
  }
}
