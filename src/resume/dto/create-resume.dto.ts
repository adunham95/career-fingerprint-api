import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateResumeDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  userID: number;
}

export class CreateResumeObjectDto {
  jobPositionID?: string;
  educationID?: string;
}
