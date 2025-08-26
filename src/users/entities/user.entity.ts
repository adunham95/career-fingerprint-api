import { Organization, Subscription, User } from '@prisma/client';

export class UserEntity implements User {
  constructor({ subscriptions = [], ...partial }: Partial<UserEntity>) {
    Object.assign(this, partial);

    if (subscriptions.length > 0) {
      this.subscription = subscriptions[0];
    }
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

  stripeCustomerID: string | null;

  inviteCode: string | null;

  orgID: string | null;

  org: Organization;

  subscriptions?: Subscription[];

  subscription?: Subscription;
}
