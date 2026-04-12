export class OrgCreatedEvent {
  constructor(
    public readonly orgId: string,
    public readonly adminUserId: string,
  ) {}
}

export class OrgMemberAddedEvent {
  constructor(
    public readonly orgId: string,
    public readonly userId: string,
    public readonly email: string,
    public readonly isNewUser: boolean,
  ) {}
}

export class OrgClientInvitedEvent {
  constructor(
    public readonly orgId: string,
    public readonly email: string,
    public readonly inviteId: string,
  ) {}
}
