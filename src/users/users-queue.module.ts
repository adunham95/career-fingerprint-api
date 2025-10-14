import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersProcessor } from './users.processor';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'users-import',
    }),
  ],
  providers: [UsersProcessor, PrismaService],
})
export class UsersQueueModule {}
