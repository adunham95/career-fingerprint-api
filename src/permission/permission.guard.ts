import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    console.log('Running Permission Guard');
    const required = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user?.permissionList) return false;
    const userPerms: Set<string> = new Set(user.permissionList);

    const hasPermission = (needed: string): boolean => {
      console.log('needed', needed);
      console.log('current', userPerms);
      // Exact match
      if (userPerms.has(needed)) return true;

      for (const p of userPerms) {
        if (p.endsWith(':*')) {
          const [userPrefix] = p.split(':');
          if (needed.startsWith(`${userPrefix}:`)) return true;
        }
      }

      return false;
    };

    return required.some(hasPermission);
  }
}
