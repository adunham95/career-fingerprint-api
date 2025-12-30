import { PartialType } from '@nestjs/swagger';
import { CreateOrgUserDto } from './create-org-user.dto';

export class UpdateOrgUserDto extends PartialType(CreateOrgUserDto) {
  roles: string[];
}
