import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateEducationDto {
  userID: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  institution?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  degree?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  currentPosition?: boolean;
}
