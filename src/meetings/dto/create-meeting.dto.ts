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
  jobAppID?: string | null;

  @ApiProperty()
  @IsOptional()
  @IsString()
  jobPositionID?: string | null;

  @ApiProperty()
  @IsOptional()
  @IsString()
  educationID?: string | null;

  @ApiProperty()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  link?: string;

  userID: number;
}
