import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateResumeDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  userID: number;
}
