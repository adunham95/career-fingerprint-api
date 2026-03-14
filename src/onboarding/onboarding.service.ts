import { BadRequestException, Injectable } from '@nestjs/common';
import { AchievementService } from 'src/achievement/achievement.service';
import { JobPositionsService } from 'src/job-positions/job-positions.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOnboardingAchievementDto } from './dto/create-onboarding-achievement.dto';
import { CreateOnboardingJobDto } from './dto/create-onboarding-job.dto';
import { CreateJobPositionDto } from 'src/job-positions/dto/create-job-position.dto';
import { CreateAchievementDto } from 'src/achievement/dto/create-achievement.dto';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobPositionsService: JobPositionsService,
    private readonly achievementService: AchievementService,
  ) {}

  createJob(dto: CreateOnboardingJobDto) {
    if (!dto.name) {
      throw new BadRequestException({
        code: 'MISSING DATA',
        message: 'Missing the name of the job',
      });
    }

    if (!dto.company) {
      throw new BadRequestException({
        code: 'MISSING DATA',
        message: 'Missing the company of the job',
      });
    }

    if (!dto.startDate) {
      throw new BadRequestException({
        code: 'MISSING DATA',
        message: 'Missing the start date of the job',
      });
    }

    const data: CreateJobPositionDto = {
      userID: dto.userID,
      name: dto.name,
      company: dto.company,
      startDate: dto.startDate,
    };

    if (dto.description) data.description = dto.description;
    if (dto.endDate) data.endDate = dto.endDate;
    if (dto.currentPosition !== undefined)
      data.currentPosition = dto.currentPosition;

    return this.jobPositionsService.create(data);
  }

  async createAchievement(dto: CreateOnboardingAchievementDto) {
    if (dto.jobName) {
      const newJob = await this.prisma.jobPosition.create({
        data: { name: dto.jobName, userID: dto.userID },
      });

      dto.jobPositionID = newJob.id;

      delete dto.jobName;
    }

    if (dto.jobPositionID) {
      const jobPosition = await this.prisma.jobPosition.findFirst({
        where: { userID: dto.userID, status: 'active' },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });

      dto.jobPositionID = jobPosition?.id;
    }

    return this.achievementService.create(dto as CreateAchievementDto);
  }
}
