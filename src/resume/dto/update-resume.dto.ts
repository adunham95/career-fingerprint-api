import { PartialType } from '@nestjs/swagger';
import { CreateResumeDto } from './create-resume.dto';

export class UpdateResumeDto extends PartialType(CreateResumeDto) {}

export class UpdateResumeObjectDto {
  description: string;

  bulletPoints?: { id: string; text: string }[];
}
