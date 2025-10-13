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

    const resume = await this.prisma.resume.create({
      data: { ...createResumeDto, name },
    });

    const myJobs = await this.prisma.jobPosition.findMany({
      where: { userID: createResumeDto.userID || 1 },
      select: { description: true, id: true },
    });

    for (let index = 0; index < myJobs.length; index++) {
      const element = myJobs[index];
      await this.prisma.resumeObject.create({
        data: {
          resumeID: resume.id,
          jobID: element.id,
          description: element.description,
        },
      });
    }

    const myEducation = await this.prisma.education.findMany({
      where: { userID: createResumeDto.userID },
      select: { description: true, id: true },
    });

    for (let index = 0; index < myEducation.length; index++) {
      const element = myEducation[index];
      await this.prisma.resumeObject.create({
        data: {
          resumeID: resume.id,
          eduID: element.id,
          description: element.description,
        },
      });
    }

    return resume;
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

    const name = selectedResume?.name
      ? `${selectedResume?.name} copy`
      : `Untitled Resume ${new Date().toISOString()}`;

    const newResume = await this.prisma.resume.create({
      data: {
        name: name,
        userID: selectedResume?.userID || 1,
      },
    });

    const objects = await this.prisma.resumeObject.findMany({
      where: {
        resumeID: selectedResume.id,
      },
    });

    for (let index = 0; index < objects.length; index++) {
      const element = objects[index];
      await this.prisma.resumeObject.create({
        data: {
          resumeID: newResume.id,
          eduID: element.eduID,
          jobID: element.jobID,
          description: element.description,
        },
      });
    }

    //TODO Add Bullet Points

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

  async removeJobObject(id: string) {
    return this.prisma.resumeObject.delete({ where: { id } });
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
