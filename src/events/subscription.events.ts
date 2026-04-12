export class SubscriptionOrgCreatedEvent {
  constructor(
    public readonly subscriptionId: string,
    public readonly orgId: string,
    public readonly userId: string,
    public readonly isNewUser: boolean,
  ) {}
}

export class SubscriptionCancelledEvent {
  constructor(
    public readonly subscriptionId: string,
    public readonly userId: string,
  ) {}
}

export class PaymentCheckoutCompletedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly stripeSessionId: string,
  ) {}
}
