import { Injectable } from '@nestjs/common';
import { createHash, createHmac, randomBytes } from 'crypto';
import { AuditService } from 'src/audit/audit.service';
import { AUDIT_EVENT } from 'src/audit/auditEvents';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LoginTokenService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private authService: AuthService,
  ) {}

  async verifyLoginToken(token: string) {
    const hashedToken = this.hashLoginToken(token);
    const now = new Date();

    const verifiedToken = await this.prisma.loginToken.findUnique({
      where: { token: hashedToken },
      include: { user: { select: { id: true } } },
    });

    console.log({ verifiedToken });

    if (!verifiedToken || !verifiedToken.user) {
      return { tokenValid: false };
    }

    const userId = verifiedToken?.user?.id;

    if (verifiedToken?.expiresAt < now) {
      console.log('failed date', now);
      await this.auditService.logEvent(AUDIT_EVENT.LOGIN_FAILED_TOKEN, userId);
      return { tokenValid: false };
    }

    await this.auditService.logEvent(AUDIT_EVENT.LOGIN_FAILED_TOKEN, userId);

    await this.prisma.loginToken.delete({ where: { token: hashedToken } });

    const { accessToken, sessionID } =
      await this.authService.loginUserByID(userId);

    return {
      tokenValid: true,
      type: verifiedToken.type,
      accessToken,
      sessionID,
    };
  }

  async createBetterAuthMagicLink(email: string, callbackURL: string) {
    const rawToken = this.generateRandomString();
    const id = this.generateRandomString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.baVerification.create({
      data: {
        id,
        identifier: rawToken,
        value: JSON.stringify({ email, attempt: 0 }),
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const base = process.env.FRONT_END_URL ?? 'http://localhost:5173';
    return `${base}/login/magic-link?token=${rawToken}&callbackURL=${encodeURIComponent(callbackURL)}`;
  }

  async consumeBetterAuthMagicLink(token: string) {
    const verification = await this.prisma.baVerification.findFirst({
      where: { identifier: token },
    });

    if (!verification || verification.expiresAt < new Date()) {
      if (verification) {
        await this.prisma.baVerification.delete({
          where: { id: verification.id },
        });
      }
      return { tokenValid: false } as const;
    }

    const { email, attempt = 0 } = JSON.parse(verification.value) as {
      email: string;
      attempt: number;
    };

    if (attempt >= 1) {
      await this.prisma.baVerification.delete({
        where: { id: verification.id },
      });
      return { tokenValid: false } as const;
    }

    await this.prisma.baVerification.delete({ where: { id: verification.id } });

    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!user?.baId) return { tokenValid: false } as const;

    const sessionToken = randomBytes(32).toString('hex');
    const sessionId = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.baSession.create({
      data: {
        id: sessionId,
        token: sessionToken,
        userId: user.baId,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Sign using the same HMAC-SHA256 algorithm as Better Auth
    const secret =
      process.env.BETTER_AUTH_SECRET ??
      process.env.SECRET ??
      'better-auth-secret';
    const signature = createHmac('sha256', secret)
      .update(sessionToken)
      .digest('base64');
    const signedToken = `${sessionToken}.${signature}`;

    const isProd = process.env.NODE_ENV === 'production';
    const cookieName = isProd
      ? '__Secure-cf.session_token'
      : 'cf.session_token';

    return { tokenValid: true, signedToken, cookieName } as const;
  }

  async createLoginToken(email: string, type: string, extended = false) {
    const now = new Date();

    const expirationDate = extended
      ? new Date(now.getTime() + 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 10 * 60 * 1000);

    const randomToken = this.generateRandomString();

    const hashedToken = this.hashLoginToken(randomToken);

    await this.prisma.loginToken.create({
      data: {
        email,
        token: hashedToken,
        type,
        expiresAt: expirationDate,
      },
    });

    return { rawToken: randomToken };
  }

  private hashLoginToken(rawToken: string) {
    const hashedToken = this.sha256(rawToken);
    return hashedToken;
  }

  private generateRandomString() {
    return randomBytes(32).toString('hex');
  }

  private sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
