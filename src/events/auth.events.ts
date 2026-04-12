export class AuthLoginSuccessEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly ip?: string,
  ) {}
}

export class AuthLoginFailedEvent {
  constructor(
    public readonly email: string,
    public readonly ip?: string,
  ) {}
}

export class AuthPasswordResetRequestedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {}
}

export class AuthPasswordResetCompletedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {}
}

export class AuthLogoutEvent {
  constructor(
    public readonly userId: string,
    public readonly sessionId: string,
  ) {}
}
