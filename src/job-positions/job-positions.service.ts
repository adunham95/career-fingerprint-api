import { Injectable } from '@nestjs/common';
import { CreateJobPositionDto } from './dto/create-job-position.dto';
import { UpdateJobPositionDto } from './dto/update-job-position.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JobPositionsService {
  constructor(private prisma: PrismaService) {}
  create(createJobPositionDto: CreateJobPositionDto) {
    return this.prisma.jobPosition.create({ data: createJobPositionDto });
  }

  findAll() {
    return this.prisma.jobPosition.findMany();
  }

  findMyJobPositions(userID: number) {
    return this.prisma.jobPosition.findMany({ where: { userID } });
  }

  findOne(id: string) {
    return this.prisma.jobPosition.findFirst({ where: { id } });
  }

  update(id: string, updateJobPositionDto: UpdateJobPositionDto) {
    return this.prisma.jobPosition.update({
      where: { id },
      data: updateJobPositionDto,
    });
  }

  remove(id: string) {
    return this.prisma.jobPosition.delete({ where: { id } });
  }
}
