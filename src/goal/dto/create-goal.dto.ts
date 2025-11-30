import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBooleanString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateGoalDto {
  userID: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsArray()
  keywords: string[];

  @ApiProperty()
  @IsArray()
  actions: string[];

  @ApiProperty()
  @IsNumber()
  targetCount: number;
}

export class GoalQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsBooleanString()
  active?: boolean;

  @IsOptional()
  @IsBooleanString()
  showProgress?: boolean;
}
