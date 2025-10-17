import { Module } from '@nestjs/common';
import { EducationService } from './education.service';
import { EducationController } from './education.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [EducationController],
  providers: [EducationService],
  imports: [PrismaModule],
  exports: [EducationService],
})
export class EducationModule {}
