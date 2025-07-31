import { Module } from '@nestjs/common';
import { AchievementTagsService } from './achievement-tags.service';
import { AchievementTagsController } from './achievement-tags.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [AchievementTagsController],
  providers: [AchievementTagsService],
  imports: [PrismaModule],
})
export class AchievementTagsModule {}
