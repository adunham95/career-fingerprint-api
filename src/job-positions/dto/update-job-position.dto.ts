import { PartialType } from '@nestjs/swagger';
import { CreateJobPositionDto } from './create-job-position.dto';

export class UpdateJobPositionDto extends PartialType(CreateJobPositionDto) {
  bulletPoints?: { id: string; text: string }[];
}
