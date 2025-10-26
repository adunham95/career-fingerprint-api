import { AuthGuard } from '@nestjs/passport';
import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class SamlAuthGuard extends AuthGuard('saml') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    // detect which route we're in
    const isCallback = req.originalUrl?.includes('/callback');

    if (isCallback) {
      // ⚙️ On callback, don't require any query params
      return {};
    }

    const email = req.query.email as string | undefined;

    if (!email) {
      throw new BadRequestException(
        'Missing email parameter. Example: /auth/sso?email=user@domain.edu',
      );
    }

    const domain = email.split('@')[1];
    if (!domain) {
      throw new BadRequestException('Invalid email address.');
    }

    // 👇 Pass RelayState and email to IdP
    return {
      additionalParams: {
        email,
        RelayState: domain, // 💾 this will come back in req.body.RelayState
      },
    };
  }
}
