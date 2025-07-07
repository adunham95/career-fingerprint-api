import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateMeetingDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  time: string | Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  jobAppID?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  jobPositionID?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  educationPositionID?: string;

  userID: number;
}
