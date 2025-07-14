import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpsertPrepAnswerDto {
  @ApiProperty()
  @IsString()
  answer: string;

  @ApiProperty()
  @IsString()
  questionID: string;

  @ApiProperty()
  @IsString()
  jobApplicationID: string;

  userID: number;
}
