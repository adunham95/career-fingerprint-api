import { Module } from '@nestjs/common';
import { MyFingerprintService } from './my-fingerprint.service';
import { MyFingerprintController } from './my-fingerprint.controller';
import { JobPositionsModule } from 'src/job-positions/job-positions.module';
import { EducationModule } from 'src/education/education.module';

@Module({
  controllers: [MyFingerprintController],
  providers: [MyFingerprintService],
  imports: [JobPositionsModule, EducationModule],
})
export class MyFingerprintModule {}
