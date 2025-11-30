import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
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

    const accessToken = await this.authService.loginUserByID(userId);

    return {
      tokenValid: true,
      type: verifiedToken.type,
      accessToken: accessToken.accessToken,
    };
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
