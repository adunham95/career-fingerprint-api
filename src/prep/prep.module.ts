import { Module } from '@nestjs/common';
import { PrepService } from './prep.service';
import { PrepController } from './prep.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [PrepController],
  providers: [PrepService],
  imports: [PrismaModule],
})
export class PrepModule {}
