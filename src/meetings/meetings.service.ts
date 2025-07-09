import { Injectable } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  create(createMeetingDto: CreateMeetingDto) {
    return this.prisma.meeting.create({ data: createMeetingDto });
  }

  findAll() {
    return `This action returns all meetings`;
  }

  findMine(userID: number) {
    return this.prisma.meeting.findMany({ where: { userID } });
  }

  findOne(id: string) {
    return this.prisma.meeting.findFirst({ where: { id } });
  }

  update(id: number, updateMeetingDto: UpdateMeetingDto) {
    return `This action updates a #${id} meeting`;
  }

  remove(id: number) {
    return `This action removes a #${id} meeting`;
  }
}
