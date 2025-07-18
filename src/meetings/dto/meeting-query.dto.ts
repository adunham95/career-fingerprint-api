import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MeetingQueryDto {
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
}

export class SingleMeetingQueryDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  highlights?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  achievements?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  questions?: boolean;
}
