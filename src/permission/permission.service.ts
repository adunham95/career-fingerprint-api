import { Injectable } from '@nestjs/common';
import { AdminPanelRoles, permissionsMap } from './permissions';

@Injectable()
export class PermissionsService {
  getPermissionsForRoles(roles: string[] = []): string[] {
    const permissions = new Set<string>();

    for (const role of roles) {
      const rolePerms = permissionsMap[role] || [];
      rolePerms.forEach((p) => permissions.add(p));
    }

    return [...permissions];
  }

  isOrgAdmin(roles: string[]) {
    return roles.some((r) => AdminPanelRoles.includes(r));
  }

  adminPanelRoles() {
    return AdminPanelRoles;
  }
}
