import { Injectable } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}
  create(createFeedbackDto: CreateFeedbackDto) {
    console.log('new feedback');
    return this.prisma.feedback.create({ data: createFeedbackDto });
  }
}
