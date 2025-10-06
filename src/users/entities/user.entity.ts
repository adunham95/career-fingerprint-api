import { Organization, Subscription, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  constructor({ subscriptions = [], ...partial }: Partial<UserEntity>) {
    Object.assign(this, partial);

    if (subscriptions.length > 0) {
      this.subscription = subscriptions[0];
    }
  }
  id: number;

  @Exclude()
  password: string;

  firstName: string;

  lastName: string;

  username: string | null;

  createdAt: Date;

  updatedAt: Date;

  accountStatus: string;

  pitch: string | null;

  email: string;

  lookingFor: string | null;

  profileImage: string | null;

  stripeCustomerID: string | null;

  inviteCode: string | null;

  emailVerified: boolean;

  orgID: string | null;

  timezone: string;

  preferredDay: number;

  nextSendAt: Date | null;

  org: Organization;

  orgs: Organization[];

  subscriptions?: Subscription[];

  subscription?: Subscription;

  redeemedFreeTrial: boolean;

  userType: string;
}
