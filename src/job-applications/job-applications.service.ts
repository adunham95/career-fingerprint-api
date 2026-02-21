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

  async findMyJobApps(userID: number) {
    const apps = await this.prisma.jobApplication.findMany({
      where: { userID },
      include: {
        _count: { select: { meetings: true } },
        coverLetter: {
          select: { id: true }, // only fetch the id, not the whole object
        },
      },
    });
    const statusOrder = [
      'negotiating',
      'interviewing',
      'applied',
      'accepted',
      'ghosted',
      'rejected',
      'archived',
    ];
    return apps.sort((a, b) => {
      return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
    });
  }

  findMyActiveJobApps(userID: number) {
    return this.prisma.jobApplication.findMany({
      where: { userID, status: { not: 'archived' } },
      select: {
        id: true,
        title: true,
        company: true,
      },
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
