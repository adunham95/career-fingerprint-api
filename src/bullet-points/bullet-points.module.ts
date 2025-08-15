import { Module } from '@nestjs/common';
import { BulletPointsService } from './bullet-points.service';
import { BulletPointsController } from './bullet-points.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [BulletPointsController],
  providers: [BulletPointsService],
  imports: [PrismaModule],
})
export class BulletPointsModule {}
