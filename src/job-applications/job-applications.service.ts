import { Injectable } from '@nestjs/common';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JobApplicationsService {
  constructor(private prisma: PrismaService) {}

  create(createJobApplicationDto: CreateJobApplicationDto) {
    return this.prisma.jobApplication.create({ data: createJobApplicationDto });
  }

  findAll() {
    return this.prisma.jobApplication.findMany();
  }

  findMyJobApps(userID: number) {
    return this.prisma.jobApplication.findMany({
      where: { userID },
      include: { _count: { select: { meetings: true } } },
    });
  }

  findOne(id: string) {
    return this.prisma.jobApplication.findFirst({ where: { id } });
  }

  update(id: string, updateJobApplicationDto: UpdateJobApplicationDto) {
    return this.prisma.jobApplication.update({
      where: { id },
      data: updateJobApplicationDto,
    });
  }

  remove(id: string) {
    return this.prisma.jobApplication.delete({ where: { id } });
  }
}
