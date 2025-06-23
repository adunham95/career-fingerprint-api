import { User } from '@prisma/client';

export class UserEntity implements User {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
  id: number;

  password: string;

  firstName: string;

  lastName: string;

  username: string;

  createdAt: Date;

  updatedAt: Date;

  accountStatus: string;

  pitch: string;

  email: string;

  lookingFor: string;

  profileImage: string;
}
