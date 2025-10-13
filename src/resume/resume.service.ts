import { Injectable } from '@nestjs/common';
import {
  CreateResumeDto,
  CreateResumeObjectDto,
} from './dto/create-resume.dto';
import {
  UpdateResumeDto,
  UpdateResumeObjectDto,
} from './dto/update-resume.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PdfService } from 'src/pdf/pdf.service';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class ResumeService {
  constructor(
    private prisma: PrismaService,
    private readonly pdfService: PdfService,
    private cache: CacheService,
  ) {}

  async create(createResumeDto: CreateResumeDto) {
    const name =
      createResumeDto.name ?? `Untitled Resume ${new Date().toISOString()}`;
    await this.cache.del(`myResumes${createResumeDto.userID}`);
    return this.prisma.resume.create({ data: { ...createResumeDto, name } });
  }

  findAll() {
    return `This action returns all resume`;
  }

  findMyResumes(userID: number) {
    return this.cache.wrap(`myResumes${userID}`, () => {
      return this.prisma.resume.findMany({ where: { userID } });
    });
  }

  findOne(id: string) {
    return this.cache.wrap(`resume:${id}`, () => {
      return this.prisma.resume.findFirst({ where: { id } });
    });
  }

  findResumeObjects(id: string) {
    return this.cache.wrap(`resumeJobObjects:${id}`, () => {
      return this.prisma.resumeObject.findMany({
        where: { resumeID: id },
        include: {
          job: { include: { achievements: true } },
          edu: { include: { achievements: true } },
          bulletPoints: true,
        },
      });
    });
  }

  findJobObject(id: string) {
    return this.cache.wrap(`resumeJobObjects:${id}`, () => {
      return this.prisma.resumeObject.findMany({
        where: { resumeID: id, eduID: undefined },
        include: {
          job: { include: { achievements: true } },
          bulletPoints: true,
        },
      });
    });
  }

  findEduObject(id: string) {
    return this.cache.wrap(`resumeEduObjects:${id}`, () => {
      return this.prisma.resumeObject.findMany({
        where: { resumeID: id, jobID: undefined },
      });
    });
  }

  async findOneAndBuildPDF(id: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id },
      include: { user: { include: { skills: true } } },
    });

    if (!resume) {
      throw new Error('Resume not found');
    }
    const jobPositions = await this.prisma.jobPosition.findMany({
      where: { userID: resume.userID },
      orderBy: { startDate: 'desc' },
      include: {
        // bulletPoints: true,
      },
    });

    const education = await this.prisma.education.findMany({
      orderBy: { startDate: 'desc' },
      where: { userID: resume.userID },
      // include: { bulletPoints: true },
    });

    const skills = await this.prisma.skills.findFirst({
      where: { userID: resume.userID },
    });
    console.log({ resume });
    return this.pdfService.createResume(
      resume,
      jobPositions,
      education,
      skills,
    );
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

  async update(id: string, updateResumeDto: UpdateResumeDto) {
    await this.cache.del(`resume:${id}`);
    return this.prisma.resume.update({ where: { id }, data: updateResumeDto });
  }

  async remove(id: string) {
    await this.cache.del(`resume:${id}`);
    return this.prisma.resume.delete({ where: { id } });
  }

  async createResumeObject(
    resumeID: string,
    { jobPositionID, educationID }: CreateResumeObjectDto,
  ) {
    let description = '';
    if (jobPositionID) {
      const currentJob = await this.prisma.jobPosition.findFirst({
        where: { id: jobPositionID },
      });

      if (!currentJob) {
        throw Error('Missing Job Position To Link');
      }
      description = currentJob.description;
    } else if (educationID) {
      const currentEdu = await this.prisma.education.findFirst({
        where: { id: educationID },
      });

      if (!currentEdu) {
        throw Error('Missing Education To Link');
      }
      description = currentEdu.description;
    }

    return this.prisma.resumeObject.create({
      data: {
        resumeID: resumeID,
        jobID: jobPositionID,
        eduID: educationID,
        description,
      },
      include: { job: true, edu: true },
    });
  }

  async updateResumeObject(
    id: string,
    resumeObjectID: string,
    updateResumeObjectDto: UpdateResumeObjectDto,
  ) {
    const { bulletPoints, ...updateObj } = updateResumeObjectDto;

    if (bulletPoints) {
      for (const bulletPoint of bulletPoints) {
        await this.prisma.bulletPoint.update({
          where: { id: bulletPoint.id },
          data: { text: bulletPoint.text },
        });
      }
    }
    return this.prisma.resumeObject.update({
      where: {
        id: resumeObjectID,
      },
      data: updateObj,
    });
  }
}
