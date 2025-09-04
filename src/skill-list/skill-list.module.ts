import { Module } from '@nestjs/common';
import { SkillListController } from './skill-list.controller';
import { SkillListService } from './skill-list.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [SkillListController],
  providers: [SkillListService],
  imports: [PrismaModule],
})
export class SkillListModule {}
