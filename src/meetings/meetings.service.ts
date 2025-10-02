import { Injectable } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SingleMeetingQueryDto } from './dto/meeting-query.dto';
import { PdfService } from 'src/pdf/pdf.service';

@Injectable()
export class MeetingsService {
  constructor(
    private prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  create(createMeetingDto: CreateMeetingDto) {
    console.log('create meeting', createMeetingDto);
    const title =
      createMeetingDto.title ?? `Untitled Meeting ${new Date().toISOString()}`;

    return this.prisma.meeting.create({ data: { ...createMeetingDto, title } });
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

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    return this.prisma.meeting.findMany({
      ...queryData,
      where: {
        userID,
        // title: { not: null },
        time: {
          gte: tenMinutesAgo,
        },
      },
      orderBy: {
        time: 'asc',
      },
    });
  }

  findMinePrevious(userID: number, query?: { page?: number; limit?: number }) {
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
        // title: { not: null },
        time: {
          lt: new Date(),
        },
      },
      orderBy: {
        time: 'asc',
      },
    });
  }

  findRelatedToJob(jobAppID: string) {
    return this.prisma.meeting.findMany({
      where: {
        jobAppID,
      },
      orderBy: {
        time: 'asc',
      },
    });
  }

  async findOne(id: string, query?: SingleMeetingQueryDto) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
      select: {
        id: true,
        jobAppID: true,
        userID: true,
      },
    });

    if (!meeting) {
      throw new Error('Meeting not found');
    }

    let include: {
      [key: string]: unknown;
    } = {
      jobApp: true,
      jobPosition: true,
      education: true,
    };

    if (query?.highlights) {
      include = {
        ...include,
        highlights: { include: { notes: true, achievements: true } },
      };
    }

    if (query?.questions) {
      console.log('include questions');
      include = {
        ...include,
        prepAnswers: {
          where: {
            OR: [{ meetingID: id }, { jobApplicationID: meeting?.jobAppID }],
          },
          take: 1,
        },
      };
    }

    console.log({ include, query });

    return this.prisma.meeting.findFirst({
      where: { id },
      include,
    });
  }

  update(id: string, updateMeetingDto: UpdateMeetingDto) {
    return this.prisma.meeting.update({
      where: { id },
      data: updateMeetingDto,
    });
  }

  async getPrepDocPdf(id: string) {
    const meeting = await this.prisma.meeting.findFirst({
      where: { id },
      include: {
        jobApp: true,
        jobPosition: true,
        education: true,
      },
    });

    if (!meeting) {
      throw new Error('Missing Meeting');
    }

    const highlights = await this.prisma.highlight.findMany({
      where: { meetingID: id },
      include: { notes: true, achievements: true },
    });

    const answers = await this.prisma.prepAnswer.findMany({
      where: {
        OR: [{ meetingID: id }, { jobApplicationID: meeting?.jobAppID }],
      },
      include: { question: true },
    });

    return this.pdfService.createPrepDoc(meeting, answers, highlights);
  }

  remove(id: number) {
    return `This action removes a #${id} meeting`;
  }
}
