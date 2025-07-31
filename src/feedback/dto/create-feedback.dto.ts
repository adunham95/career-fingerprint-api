import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString } from 'class-validator';

export class CreateFeedbackDto {
  userID: number;

  @ApiProperty()
  @IsString()
  feedback: string;

  @ApiProperty()
  @IsString()
  page: string;

  @ApiProperty()
  @IsString()
  device: string;

  @ApiProperty()
  @IsInt()
  rating: number;

  @ApiProperty()
  @IsBoolean()
  contact: boolean;
}
