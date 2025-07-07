import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [MeetingsController],
  providers: [MeetingsService],
  imports: [PrismaModule],
})
export class MeetingsModule {}
