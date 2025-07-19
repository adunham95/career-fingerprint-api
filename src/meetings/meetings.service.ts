import { Injectable } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SingleMeetingQueryDto } from './dto/meeting-query.dto';

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
      skip?: number;
      take?: number;
    } = {};
    if (query?.limit && query.page) {
      const { page, limit } = query;
      const skip = (page - 1) * limit;
      queryData.skip = skip;
      queryData.take = limit;
    }

    return this.prisma.meeting.findMany({
      ...queryData,
      where: { userID },
      orderBy: {
        time: 'desc',
      },
    });
  }

  findMineUpcoming(userID: number, query?: { page?: number; limit?: number }) {
    const queryData: {
      skip?: number;
      take?: number;
    } = {};
    if (query?.limit && query.page) {
      const { page, limit } = query;
      const skip = (page - 1) * limit;
      queryData.skip = skip;
      queryData.take = limit;
    }

    return this.prisma.meeting.findMany({
      ...queryData,
      where: {
        userID,
        title: { not: null },
        time: {
          gt: new Date(),
        },
      },
      orderBy: {
        time: 'asc',
      },
    });
  }

  findOne(id: string, query?: SingleMeetingQueryDto) {
    let include: {
      [key: string]:
        | boolean
        | {
            include: {
              [key: string]: boolean | { include: { [key: string]: boolean } };
            };
          };
    } = {
      jobApp: { include: { prepAnswer: { include: { question: true } } } },
      jobPosition: true,
      education: true,
    };

    if (query?.highlights) {
      include = {
        ...include,
        highlights: { include: { notes: true, achievements: true } },
      };
    }

    console.log({ include, query });

    return this.prisma.meeting.findFirst({
      where: { id },
      // include: { jobApp: true, jobPosition: true, education: true },
      include,
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
