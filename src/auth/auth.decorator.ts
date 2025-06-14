import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Extracts the Bearer token from the Authorization header.
 * Returns `string | null` depending on whether the token is present.
 */
export const AuthToken = createParamDecorator(
  (ctx: ExecutionContext): string | undefined => {
    const request: Request = ctx.switchToHttp().getRequest();

    // 2. Fallback to Authorization header
    const authHeader = request.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    return undefined;
  },
);
