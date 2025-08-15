import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateBulletPointDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  jobPositionID: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  educationID: string;

  @ApiProperty({ default: '' })
  @IsString()
  @IsOptional()
  text: string = '';

  userID: number;

  @ApiProperty()
  @IsString()
  resumeID: string;
}
