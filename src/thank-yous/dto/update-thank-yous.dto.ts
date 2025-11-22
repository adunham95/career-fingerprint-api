import { PartialType } from '@nestjs/swagger';
import { CreateThankYousDto } from './create-thank-yous.dto';

export class UpdateThankYousDto extends PartialType(CreateThankYousDto) {}
