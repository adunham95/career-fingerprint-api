import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PdfModule } from 'src/pdf/pdf.module';

@Module({
  controllers: [MeetingsController],
  providers: [MeetingsService],
  imports: [PrismaModule, PdfModule],
})
export class MeetingsModule {}
