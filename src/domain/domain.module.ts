import { Module } from '@nestjs/common';
import { DomainService } from './domain.service';
import { DomainController } from './domain.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [DomainController],
  providers: [DomainService],
  imports: [PrismaModule],
})
export class DomainModule {}
