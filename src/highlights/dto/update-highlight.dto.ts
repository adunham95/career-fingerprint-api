import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateHighlightDto } from './create-highlight.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateHighlightDto extends PartialType(CreateHighlightDto) {
  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  uncheckAchievementIDs: string[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  noteID: string;
}
