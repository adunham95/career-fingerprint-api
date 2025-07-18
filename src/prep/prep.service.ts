import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpsertPrepAnswerDto } from './dto/upsert-prep-answer.dto';

@Injectable()
export class PrepService {
  constructor(private prisma: PrismaService) {}

  findAllPrepQuestions() {
    return this.prisma.prepQuestion.findMany();
  }

  async findAllPrepQuestionsForMeeting(id: string, userID: number) {
    const meeting = await this.prisma.meeting.findFirst({ where: { id } });
    console.log({ meeting });
    return this.prisma.prepQuestion.findMany({
      where: {
        displayOn: { has: meeting?.type },
      },
      orderBy: { order: 'asc' },
      include: {
        prepAnswers: {
          where: { jobApplicationID: meeting?.jobAppID, userID },
          take: 1,
        },
      },
    });
  }

  async addPrepAnswer(upsertPrepAnswerDto: UpsertPrepAnswerDto) {
    console.log({ upsertPrepAnswerDto });

    return this.prisma.prepAnswer.upsert({
      where: {
        userID_jobApplicationID_questionID: {
          userID: upsertPrepAnswerDto.userID,
          jobApplicationID: upsertPrepAnswerDto.jobApplicationID,
          questionID: upsertPrepAnswerDto.questionID,
        },
      },
      update: {
        answer: upsertPrepAnswerDto.answer,
      },
      create: upsertPrepAnswerDto,
    });
  }
}
