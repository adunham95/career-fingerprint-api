import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PdfModule } from 'src/pdf/pdf.module';
import { AuthModule as AppAuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [MeetingsController],
  providers: [MeetingsService],
  imports: [PrismaModule, PdfModule, AppAuthModule],
})
export class MeetingsModule {}
