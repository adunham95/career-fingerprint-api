import { Module } from '@nestjs/common';
import { JobPositionsService } from './job-positions.service';
import { JobPositionsController } from './job-positions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [JobPositionsController],
  providers: [JobPositionsService],
  imports: [PrismaModule],
})
export class JobPositionsModule {}
