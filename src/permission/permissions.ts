export type PermissionsMap = Record<string, string[]>;

export const permissionRoles = [
  {
    label: 'Org Owner',
    id: 'org_owner',
    description:
      'Full control of the organization, including billing, users, admins, SSO, and all data.',
  },
  {
    label: 'Org Admin',
    id: 'org_admin',
    description:
      'Manages organization settings, domains, seats, users, clients, and reporting.',
  },
  {
    label: 'Billing Admin',
    id: 'billing_admin',
    description:
      'Manages billing details, invoices, payment methods, and subscription plans.',
  },
  {
    label: 'User Admin',
    id: 'user_admin',
    description:
      'Manages users and clients, including access, roles, and profiles.',
  },
  {
    label: 'Advisor',
    id: 'advisor_admin',
    description:
      'Can view reports and access career data to review, edit, comment, and export.',
  },
  {
    label: 'Viewer',
    id: 'viewer',
    description: 'Read-only access to reports, career data, and client lists.',
  },
  {
    label: 'SSO Admin',
    id: 'sso_admin',
    description:
      'Configures and manages single sign-on (SSO) settings for the organization.',
  },
];

export const permissionsMap: PermissionsMap = {
  org_owner: [
    'org:*',
    'client:*',
    'billing:*',
    'career:*',
    'sso:*',
    'reports:*',
    'admins:*',
    'users:*',
  ],
  org_admin: [
    'reports:view',
    'org:view',
    'org:update_details',
    'org:update_logo',
    'org:view_domains',
    'org:manage_domains',
    'org:manage_seats',
    'org:manage_admins',
    'org:create_promo_code',
    'org:view_promo_code',
    'admins:view',
    'admins:manage',
    'client:list',
    'client:add',
    'client:assign_roles',
    'client:remove',
    'client:view_profile',
    'users:list',
    'users:add',
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
  client_admin: [
    'reports:view',
    'client:list',
    'client:create',
    'client:add',
    'client:assign_roles',
    'client:remove',
    'client:view_profile',
    'users:list',
    'users:create',
    'users:add',
    'users:assign_roles',
    'users:remove',
    'users:view_profile',
  ],
  advisor: [
    'reports:view',
    'career:view',
    'career:edit',
    'career:comment',
    'career:export',
    'client:list',
    'users:list',
    'org:view_promo_code',
  ],
  viewer: ['reports:view', 'career:view', 'client:list'],
  sso_admin: ['sso:view', 'sso:configure', 'sso:disable'],
};

export const AdminPanelRoles = Object.keys(permissionsMap);
