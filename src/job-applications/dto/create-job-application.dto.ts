import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { JobApplicationStatus } from 'src/utils/jobApplicationStatus';

export class CreateJobApplicationDto {
  userID: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  companyURL?: string;

  @ApiProperty()
  @IsEnum(JobApplicationStatus)
  @IsOptional()
  status: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  jobDescription?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  jobDescriptionURL?: string;
}
