import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateJobPositionDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  startDate: string | Date;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  endDate?: string | Date;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  currentPosition?: boolean;

  @ApiProperty({ default: '' })
  @IsString()
  @IsOptional()
  company: string;

  userID: number;
}
