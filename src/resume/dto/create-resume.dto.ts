import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateResumeDto {
  @ApiProperty()
  @IsString()
  name: string;

  userID: number;
}
