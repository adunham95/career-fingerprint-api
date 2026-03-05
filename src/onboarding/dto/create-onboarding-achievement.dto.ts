import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateOnboardingAchievementDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  result?: string;

  @ApiProperty()
  @IsString()
  myContribution: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  jobPositionID?: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  startDate?: string | Date;

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
