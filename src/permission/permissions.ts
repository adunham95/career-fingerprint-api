export type PermissionsMap = Record<string, string[]>;

export const permissionsMap: PermissionsMap = {
  org_owner: ['org:*', 'users:*', 'billing:*', 'career:*', 'sso:*'],
  org_admin: [
    'org:view',
    'org:update_details',
    'org:update_logo',
    'org:view_domains',
    'org:manage_domains',
    'org:manage_seats',
    'org:manage_admins',
    'org:view_admins',
    'users:list',
    'users:create',
    'users:assign_roles',
    'users:remove',
    'users:view_profile',
  ],
  billing_admin: [
    'billing:view',
    'billing:view_invoices',
    'billing:update_payment_method',
    'billing:update_plan',
  ],
  user_admin: [
    'users:list',
    'users:create',
    'users:assign_roles',
    'users:remove',
    'users:view_profile',
  ],
  advisor: ['career:view', 'career:edit', 'career:comment', 'career:export'],
  viewer: ['org:view', 'career:view'],
  sso_admin: ['sso:view', 'sso:configure', 'sso:disable'],
};
