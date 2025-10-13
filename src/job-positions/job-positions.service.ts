import { Injectable } from '@nestjs/common';
import { CreateJobPositionDto } from './dto/create-job-position.dto';
import { UpdateJobPositionDto } from './dto/update-job-position.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JobPositionsService {
  constructor(private prisma: PrismaService) {}
  create(createJobPositionDto: CreateJobPositionDto) {
    if (createJobPositionDto.startDate) {
      createJobPositionDto.startDate = new Date(createJobPositionDto.startDate);
    }
    if (createJobPositionDto.endDate) {
      createJobPositionDto.endDate = new Date(createJobPositionDto.endDate);
    }
    return this.prisma.jobPosition.create({ data: createJobPositionDto });
  }

  async createFromJobApplication(userID: number, jobApplicationID: string) {
    const jobApplication = await this.prisma.jobApplication.findFirst({
      where: { id: jobApplicationID },
    });

    if (jobApplication?.migrated === true) {
      throw Error('Already migrated');
    }

    const newJobPosition = await this.prisma.jobPosition.create({
      data: {
        name: jobApplication?.title || '',
        userID,
        currentPosition: true,
        description: jobApplication?.jobDescription || '',
        company: jobApplication?.company || '',
        location: jobApplication?.location || '',
        startDate: new Date(),
      },
    });

    await this.prisma.jobApplication.update({
      where: { id: jobApplicationID },
      data: { migrated: true },
    });

    return newJobPosition;
  }

  findAll() {
    return this.prisma.jobPosition.findMany();
  }

  async findMyJobPositions(userID: number) {
    return this.prisma.jobPosition.findMany({
      where: { userID },
      orderBy: { startDate: { sort: 'desc', nulls: 'last' } },
      include: {
        achievements: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.jobPosition.findFirst({ where: { id } });
  }

  async update(id: string, updateJobPositionDto: UpdateJobPositionDto) {
    if (updateJobPositionDto.startDate) {
      updateJobPositionDto.startDate = new Date(updateJobPositionDto.startDate);
    }
    if (updateJobPositionDto.endDate) {
      updateJobPositionDto.endDate = new Date(updateJobPositionDto.endDate);
    }
    const { bulletPoints, ...updateJobPosition } = updateJobPositionDto;

    if (bulletPoints) {
      for (const bulletPoint of bulletPoints) {
        await this.prisma.bulletPoint.update({
          where: { id: bulletPoint.id },
          data: { text: bulletPoint.text },
        });
      }
    }

    return this.prisma.jobPosition.update({
      where: { id },
      data: updateJobPosition,
    });
  }

  remove(id: string) {
    return this.prisma.jobPosition.delete({ where: { id } });
  }

  removeBulletPoint(id: string) {
    return this.prisma.bulletPoint.delete({ where: { id } });
  }
}
