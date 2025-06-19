import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateAchievementDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  goal?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  result?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  metrics?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  myContribution?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  jobPostingID?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  projectID?: string;

  userID: number;
}
