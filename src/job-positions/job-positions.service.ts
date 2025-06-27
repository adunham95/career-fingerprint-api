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

  findAll() {
    return this.prisma.jobPosition.findMany();
  }

  async findMyJobPositions(userID: number) {
    return this.prisma.jobPosition.findMany({
      where: { userID },
      orderBy: { startDate: { sort: 'desc', nulls: 'last' } },
    });
  }

  findOne(id: string) {
    return this.prisma.jobPosition.findFirst({ where: { id } });
  }

  update(id: string, updateJobPositionDto: UpdateJobPositionDto) {
    if (updateJobPositionDto.startDate) {
      updateJobPositionDto.startDate = new Date(updateJobPositionDto.startDate);
    }
    if (updateJobPositionDto.endDate) {
      updateJobPositionDto.endDate = new Date(updateJobPositionDto.endDate);
    }
    return this.prisma.jobPosition.update({
      where: { id },
      data: updateJobPositionDto,
    });
  }

  remove(id: string) {
    return this.prisma.jobPosition.delete({ where: { id } });
  }
}
