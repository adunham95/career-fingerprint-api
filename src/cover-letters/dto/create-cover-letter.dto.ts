import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateCoverLetterDto {
  userID: number;

  @ApiProperty({ default: '' })
  @IsString()
  @IsOptional()
  message: string;

  @ApiProperty({ default: 'Hiring Manager' })
  @IsString()
  @IsOptional()
  to: string;

  @ApiProperty()
  @IsString()
  jobAppID: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  default: boolean;
}
