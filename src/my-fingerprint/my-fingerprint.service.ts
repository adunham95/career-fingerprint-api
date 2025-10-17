import { Injectable } from '@nestjs/common';
import { CacheService } from 'src/cache/cache.service';
import { EducationService } from 'src/education/education.service';
import { JobPositionsService } from 'src/job-positions/job-positions.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MyFingerprintService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private jobPositions: JobPositionsService,
    private education: EducationService,
  ) {}
  async byUser(id: number) {
    const jobs = await this.jobPositions.findMyJobPositions(id);
    const education = await this.education.findMyEducation(id);

    return { jobs, education };
  }
}
