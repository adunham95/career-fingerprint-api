import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateJobPositionDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsDateString()
  startDate: Date;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  currentPosition?: boolean;

  @ApiProperty({ default: '' })
  @IsString()
  company: string;

  userID: number;
}
