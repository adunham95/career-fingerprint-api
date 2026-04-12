export * from './user.events';
export * from './auth.events';
export * from './org.events';
export * from './subscription.events';

export const AppEvents = {
  // User
  USER_CREATED: 'user.created',
  USER_REGISTERED: 'user.registered',

  // Auth
  AUTH_LOGIN_SUCCESS: 'auth.login.success',
  AUTH_LOGIN_FAILED: 'auth.login.failed',
  AUTH_PASSWORD_RESET_REQUESTED: 'auth.password-reset.requested',
  AUTH_PASSWORD_RESET_COMPLETED: 'auth.password-reset.completed',
  AUTH_LOGOUT: 'auth.logout',

  // Org
  ORG_CREATED: 'org.created',
  ORG_MEMBER_ADDED: 'org.member.added',
  ORG_CLIENT_INVITED: 'org.client.invited',

  // Subscriptions / Payments
  SUBSCRIPTION_ORG_CREATED: 'subscription.org.created',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  PAYMENT_CHECKOUT_COMPLETED: 'payment.checkout.completed',
} as const;
