import { Module } from '@nestjs/common';
import { CoverLettersService } from './cover-letters.service';
import { CoverLettersController } from './cover-letters.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PdfModule } from 'src/pdf/pdf.module';

@Module({
  controllers: [CoverLettersController],
  providers: [CoverLettersService],
  imports: [PrismaModule, PdfModule],
})
export class CoverLettersModule {}
