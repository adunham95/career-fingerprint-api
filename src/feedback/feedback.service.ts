import { Injectable, Logger } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);
  constructor(private prisma: PrismaService) {}
  create(createFeedbackDto: CreateFeedbackDto) {
    return this.prisma.feedback.create({ data: createFeedbackDto });
  }
}
