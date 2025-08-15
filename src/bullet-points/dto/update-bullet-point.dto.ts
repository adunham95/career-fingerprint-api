import { PartialType } from '@nestjs/swagger';
import { CreateBulletPointDto } from './create-bullet-point.dto';

export class UpdateBulletPointDto extends PartialType(CreateBulletPointDto) {}
