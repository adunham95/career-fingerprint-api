import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateOnboardingJobDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  startDate?: string | Date;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  endDate?: string | Date;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  currentPosition?: boolean;

  userID: number;
}
