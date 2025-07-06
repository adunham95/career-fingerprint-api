import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAchievementDto {
  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  result?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  myContribution?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  jobID?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  educationID?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  startDate: string | Date;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  endDate?: string | Date;

  userID: number;
}
