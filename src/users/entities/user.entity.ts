import { User } from '@prisma/client';

export class UserEntity implements User {
  id: number;

  password: string;

  firstName: string;

  lastName: string;

  username: string;

  createdAt: Date;

  updatedAt: Date;

  accountStatus: string;
}
