import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { colorList } from '../colorList';

export class CreateAchievementTagDto {
  userID: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsIn(colorList, {
    message: 'color must be one of the following values: red, blue, green',
  })
  @IsOptional()
  color?: string;
}
