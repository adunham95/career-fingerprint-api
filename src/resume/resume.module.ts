import { Module } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { ResumeController } from './resume.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PdfModule } from 'src/pdf/pdf.module';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  controllers: [ResumeController],
  providers: [ResumeService],
  imports: [PrismaModule, PdfModule, CacheModule],
})
export class ResumeModule {}
