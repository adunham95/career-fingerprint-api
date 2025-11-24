import { Module } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PdfModule } from 'src/pdf/pdf.module';

@Module({
  controllers: [AchievementController],
  providers: [AchievementService],
  imports: [PrismaModule, PdfModule],
  exports: [AchievementService],
})
export class AchievementModule {}
