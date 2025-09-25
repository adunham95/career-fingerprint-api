import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PdfModule } from 'src/pdf/pdf.module';

@Module({
  controllers: [NotesController],
  providers: [NotesService],
  imports: [PrismaModule, PdfModule],
})
export class NotesModule {}
