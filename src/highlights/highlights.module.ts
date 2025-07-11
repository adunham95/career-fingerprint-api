import { Module } from '@nestjs/common';
import { HighlightsService } from './highlights.service';
import { HighlightsController } from './highlights.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [HighlightsController],
  providers: [HighlightsService],
  imports: [PrismaModule],
})
export class HighlightsModule {}
