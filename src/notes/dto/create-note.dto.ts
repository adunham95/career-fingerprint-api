import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty()
  @IsString()
  note: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  jobApplicationID: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  meetingID: string;

  userID: number;
}
