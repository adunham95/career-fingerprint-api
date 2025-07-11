import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateHighlightDto {
  @ApiProperty()
  @IsString()
  text: string;

  userID: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  achievementIDs?: string[];

  @ApiProperty()
  @IsString()
  meetingID: string;
}
