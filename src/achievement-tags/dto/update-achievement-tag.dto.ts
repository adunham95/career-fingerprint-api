import { PartialType } from '@nestjs/swagger';
import { CreateAchievementTagDto } from './create-achievement-tag.dto';

export class UpdateAchievementTagDto extends PartialType(CreateAchievementTagDto) {}
