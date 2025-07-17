import { Injectable } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  create(createMeetingDto: CreateMeetingDto) {
    console.log('create meeting', CreateMeetingDto);

    return this.prisma.meeting.create({ data: createMeetingDto });
  }

  findAll() {
    return `This action returns all meetings`;
  }

  findMine(userID: number, query?: { page?: number; limit?: number }) {
    const queryData: {
      where: { userID: number };
      skip?: number;
      take?: number;
    } = {
      where: { userID },
    };
    if (query?.limit && query.page) {
      const { page, limit } = query;
      const skip = (page - 1) * limit;
      queryData.skip = skip;
      queryData.take = limit;
    }

    return this.prisma.meeting.findMany({
      ...queryData,
      orderBy: { time: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.meeting.findFirst({
      where: { id },
      include: { jobApp: true, jobPosition: true, education: true },
    });
  }

  update(id: string, updateMeetingDto: UpdateMeetingDto) {
    return this.prisma.meeting.update({
      where: { id },
      data: updateMeetingDto,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} meeting`;
  }
}
