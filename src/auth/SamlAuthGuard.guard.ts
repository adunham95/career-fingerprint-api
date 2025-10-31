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
    console.log('🧭 SAML Auth Guard triggered', req.params, req.query);

    // detect which route we're in
    const isCallback = req.originalUrl?.includes('/callback');

    if (isCallback) {
      // ⚙️ On callback, don't require any query params
      return {};
    }

    const email = req.query.email as string | undefined;
    const domainParam = req.params?.domain as string | undefined;

    console.log({ email, domainParam });

    let finalEmail: string | undefined;
    let domain: string | undefined;

    if (email) {
      // ✅ Standard SP-initiated case
      finalEmail = email;
      domain = email.split('@')[1];
    } else if (domainParam) {
      // ✅ Support /auth/sso/:domain pattern (no email provided)
      domain = domainParam.toLowerCase();
      finalEmail = `placeholder@${domain}`;
      // Optional: you could throw instead of faking an email
      // if your org lookup logic doesn't require it
    }

    if (!domain) {
      throw new BadRequestException(
        'Missing email or domain. Example: /auth/sso?email=user@domain.edu or /auth/sso/:domain',
      );
    }

    console.log({ domain });

    // 👇 Pass RelayState and email to IdP
    return {
      additionalParams: {
        email: finalEmail,
        RelayState: domain, // 💾 this will come back in req.body.RelayState
      },
    };
  }
}
