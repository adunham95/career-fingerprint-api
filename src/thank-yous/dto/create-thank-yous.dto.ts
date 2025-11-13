import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { CreateContactDto } from 'src/contacts/dto/create-contact.dto';

export class CreateThankYousDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  contacts: CreateContactDto[];
}
