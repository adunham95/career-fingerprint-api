import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

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
  jobPositionID?: string;

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

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  achievementTags?: string[];

  userID: number;
}
