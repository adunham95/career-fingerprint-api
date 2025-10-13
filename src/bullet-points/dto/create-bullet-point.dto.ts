import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateBulletPointDto {
  @ApiProperty()
  @IsString()
  resumeObjectID: string;

  @ApiProperty({ default: '' })
  @IsString()
  @IsOptional()
  text: string = '';

  userID: number;
}
