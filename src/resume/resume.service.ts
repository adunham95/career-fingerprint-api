import { Injectable } from '@nestjs/common';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PdfService } from 'src/pdf/pdf.service';

@Injectable()
export class ResumeService {
  constructor(
    private prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}
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

  async findOneAndBuildPDF(id: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id },
      include: { user: true },
    });

    if (!resume) {
      throw new Error('Resume not found');
    }
    const jobPositions = await this.prisma.jobPosition.findMany({
      where: { userID: resume.userID },
      orderBy: { startDate: 'desc' },
      include: {
        bulletPoints: true,
      },
    });

    const education = await this.prisma.education.findMany({
      orderBy: { startDate: 'desc' },
      where: { userID: resume.userID },
      include: { bulletPoints: true },
    });
    console.log({ resume });
    return this.pdfService.createResume(resume, jobPositions, education);
  }

  async duplicateResume(id: string) {
    const selectedResume = await this.prisma.resume.findFirst({
      where: { id },
    });

    if (!selectedResume) {
      throw Error('Missing resume');
    }

    const newResume = await this.prisma.resume.create({
      data: {
        name: `${selectedResume?.name} copy`,
        userID: selectedResume?.userID || 1,
      },
    });

    return newResume;
  }

  update(id: string, updateResumeDto: UpdateResumeDto) {
    return this.prisma.resume.update({ where: { id }, data: updateResumeDto });
  }

  remove(id: string) {
    return this.prisma.resume.delete({ where: { id } });
  }
}
