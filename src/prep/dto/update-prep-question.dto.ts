import { PartialType } from '@nestjs/swagger';
import { CreatePrepQuestionDto } from './create-prep-question.dto';

export class UpdatePrepQuestionDto extends PartialType(CreatePrepQuestionDto) {}
