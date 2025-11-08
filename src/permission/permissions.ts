export type PermissionsMap = Record<string, string[]>;

export const permissionsMap: PermissionsMap = {
  org_owner: [
    'org:*',
    'users:*',
    'billing:*',
    'career:*',
    'sso:*',
    'reports:*',
    'admins:*',
  ],
  org_admin: [
    'reports:view',
    'org:view',
    'org:update_details',
    'org:manage_seats',
    'admins:view',
    'admins:manage',
    'admins:remove',
    'users:list',
    'users:add',
    'users:remove',
    'users:view_profile',
  ],
  billing_admin: [
    'billing:view',
    'billing:view_invoices',
    'billing:update_payment_method',
    'billing:update_plan',
  ],
  user_admin: ['reports:view', 'users:list', 'users:add', 'users:remove'],
  advisor: [
    'reports:view',
    'career:view',
    'career:edit',
    'career:comment',
    'career:export',
    'users:list',
  ],
  viewer: ['reports:view', 'career:view', 'users:list'],
  sso_admin: ['sso:view', 'sso:configure', 'sso:disable'],
};
