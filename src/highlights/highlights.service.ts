import { Injectable } from '@nestjs/common';
import { CreateHighlightDto } from './dto/create-highlight.dto';
import { UpdateHighlightDto } from './dto/update-highlight.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HighlightsService {
  constructor(private prisma: PrismaService) {}
  async create(createHighlightDto: CreateHighlightDto) {
    const data: { userID: number; text: string; meetingID: string } = {
      userID: createHighlightDto.userID,
      text: createHighlightDto.text,
      meetingID: createHighlightDto.meetingID,
    };
    const highlight = await this.prisma.highlight.create({
      data,
    });

    if (createHighlightDto.note) {
      await this.prisma.note.create({
        data: {
          note: createHighlightDto.note,
          userID: createHighlightDto.userID,
          highlightID: highlight.id,
          meetingID: createHighlightDto.meetingID,
        },
      });
    }

    if (createHighlightDto.achievementIDs) {
      await this.prisma.highlight.update({
        where: { id: highlight.id },
        data: {
          achievements: {
            connect: createHighlightDto.achievementIDs.map((a) => {
              return { id: a };
            }),
          },
        },
      });
    }

    return highlight;
  }

  findAll() {
    return `This action returns all highlights`;
  }

  async findForMeeting(meetingID: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingID },
      select: { jobAppID: true },
    });

    if (!meeting) {
      throw new Error('Not Found');
    }

    return this.prisma.highlight.findMany({
      where: {
        meetings: { OR: [{ id: meetingID }, { jobAppID: meeting.jobAppID }] },
      },
      include: { notes: true, achievements: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} highlight`;
  }

  async update(id: string, updateHighlightDto: UpdateHighlightDto) {
    if (updateHighlightDto.note && updateHighlightDto.noteID) {
      await this.prisma.note.update({
        where: { id: updateHighlightDto.noteID },
        data: { note: updateHighlightDto.note },
      });
    }

    return this.prisma.highlight.update({
      where: { id },
      data: {
        text: updateHighlightDto.text,
        achievements: {
          connect: updateHighlightDto.achievementIDs?.map((achID) => ({
            id: achID,
          })),
          disconnect: updateHighlightDto.uncheckAchievementIDs?.map(
            (achID) => ({ id: achID }),
          ),
        },
      },
    });
  }

  remove(id: string) {
    return this.prisma.highlight.delete({ where: { id } });
  }
}
