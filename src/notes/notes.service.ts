import { Injectable } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  create(createNoteDto: CreateNoteDto) {
    return this.prisma.note.create({ data: createNoteDto });
  }

  findAll() {
    return `This action returns all notes`;
  }

  findMy(userID: number) {
    return this.prisma.note.findFirst({ where: { userID } });
  }

  findOne(id: number) {
    return `This action returns a #${id} note`;
  }

  findByJobApplication(id: string) {
    return this.prisma.note.findMany({
      where: { meetings: { jobAppID: id }, highlight: null },
    });
  }

  async findByMeeting(meetingID: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingID },
      select: { jobAppID: true },
    });

    console.log({ meeting });

    if (!meeting) {
      throw new Error('Not Found');
    }

    return this.prisma.note.findMany({
      where: {
        meetings: {
          OR: [{ id: meetingID }, { jobAppID: meeting.jobAppID }],
        },
        AND: { highlightID: null },
      },
    });
  }

  update(id: string, updateNoteDto: UpdateNoteDto) {
    return this.prisma.note.update({ where: { id }, data: updateNoteDto });
  }

  remove(id: string) {
    return this.prisma.note.delete({ where: { id } });
  }
}
