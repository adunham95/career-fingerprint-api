import { Injectable } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SingleMeetingQueryDto } from './dto/meeting-query.dto';
import { PdfService } from 'src/pdf/pdf.service';
import { Prisma } from '@prisma/client';

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
      where: { userID, status: { not: 'archived' } },
      orderBy: {
        time: 'desc',
      },
      include: {
        jobApp: { select: { company: true, title: true } },
        jobPosition: { select: { company: true, name: true } },
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
        status: { not: 'archived' },
        // title: { not: null },
        time: {
          gte: tenMinutesAgo,
        },
      },
      orderBy: {
        time: 'asc',
      },
      include: {
        jobApp: { select: { company: true, title: true } },
        jobPosition: { select: { company: true, name: true } },
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
        status: { not: 'archived' },
        // title: { not: null },
        time: {
          lt: new Date(),
        },
      },
      orderBy: {
        time: 'asc',
      },
      include: {
        jobApp: { select: { company: true, title: true } },
        jobPosition: { select: { company: true, name: true } },
      },
    });
  }

  findRelatedToJob(jobAppID: string) {
    return this.prisma.meeting.findMany({
      where: {
        jobAppID,
        status: { not: 'archived' },
      },
      orderBy: {
        time: 'asc',
      },
    });
  }

  async findOne(id: string, query?: SingleMeetingQueryDto) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id, status: { not: 'archived' } },
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
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      jobAppID,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      jobPositionID,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      educationID,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      userID,
      ...meetingData
    } = updateMeetingDto;
    const data: Prisma.MeetingUpdateInput = meetingData;

    if (updateMeetingDto.type === 'Interview') {
      updateMeetingDto.jobPositionID = null;
      updateMeetingDto.educationID = null;
      data.jobPosition = { disconnect: true };
      data.education = { disconnect: true };
    }

    if (updateMeetingDto.type === 'Internal') {
      updateMeetingDto.jobAppID = null;
      data.jobApp = { disconnect: true };
    }

    if ('jobAppID' in updateMeetingDto) {
      if (updateMeetingDto.jobAppID === null)
        data.jobApp = { disconnect: true };
      else if (updateMeetingDto.jobAppID)
        data.jobApp = { connect: { id: updateMeetingDto.jobAppID } };
    }

    if ('jobPositionID' in updateMeetingDto) {
      if (updateMeetingDto.jobPositionID === null)
        data.jobPosition = { disconnect: true };
      else if (updateMeetingDto.jobPositionID)
        data.jobPosition = { connect: { id: updateMeetingDto.jobPositionID } };
    }

    if ('educationID' in updateMeetingDto) {
      if (updateMeetingDto.educationID === null)
        data.education = { disconnect: true };
      else if (updateMeetingDto.educationID)
        data.education = {
          connect: { id: updateMeetingDto.educationID },
        };
    }

    return this.prisma.meeting.update({
      where: { id },
      data,
    });
  }

  async getPrepDocPdf(id: string) {
    const meeting = await this.prisma.meeting.findFirst({
      where: { id, status: { not: 'archived' } },
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

  remove(id: string) {
    return this.prisma.meeting.update({
      where: { id },
      data: { status: 'archived' },
    });
  }
}
