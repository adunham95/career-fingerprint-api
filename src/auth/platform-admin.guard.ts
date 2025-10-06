import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const user = request.user; // Assumes you've added user to request (e.g., with AuthGuard)
    console.log(user);
    if (!user?.id) {
      throw new ForbiddenException('User not authenticated');
    }

    return user.userType === 'platform-admin';
  }
}
