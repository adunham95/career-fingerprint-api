import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpsertPrepAnswerDto {
  @ApiProperty()
  @IsString()
  answer: string;

  @ApiProperty()
  @IsString()
  questionID: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  jobApplicationID: string;

  @ApiProperty()
  @IsString()
  meetingID: string;

  userID: number;
}
