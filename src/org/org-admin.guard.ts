import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class OrgMemberGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();
    const user = req.user;

    console.log('user', user);

    if (!user || user.mode !== 'org') {
      throw new ForbiddenException('You must be in an organization session');
    }

    return true;
  }
}
