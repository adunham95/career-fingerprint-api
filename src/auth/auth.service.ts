import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import crypto, { randomUUID } from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { FailedLoginService } from './failed-login.service';
import { AuditService } from 'src/audit/audit.service';
import { AUDIT_EVENT } from 'src/audit/auditEvents';
import { PermissionsService } from 'src/permission/permission.service';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SESSION_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mail: MailService,
    private failedLoginService: FailedLoginService,
    private auditService: AuditService,
    private permissionService: PermissionsService,
    private cache: CacheService,
  ) {}

  async createSession(userID: number, email: string): Promise<string> {
    const sessionID = randomUUID();
    await this.cache.set(
      `session:${sessionID}`,
      { userID, email, createdAt: new Date().toISOString() },
      this.SESSION_TTL,
    );
    return sessionID;
  }

  async getSession(
    sessionID: string,
  ): Promise<{ userID: number; email: string } | null> {
    return this.cache.get<{ userID: number; email: string }>(
      `session:${sessionID}`,
    );
  }

  async deleteSession(sessionID: string): Promise<void> {
    await this.cache.del(`session:${sessionID}`);
  }

  async loginUser(email: string, pass: string, ipAddress?: string) {
    if (await this.failedLoginService.isBlocked(email)) {
      await this.auditService.logEvent(
        AUDIT_EVENT.LOGIN_FAILED,
        undefined,
        ipAddress,
        { email, type: 'too_many_attempts' },
      );
      throw new HttpException(
        'Too many failed login attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const user = await this.usersService.user({
      email: email.toLowerCase(),
      accountStatus: 'active',
    });

    if (!user) {
      await this.failedLoginService.recordFailure(email);
      await this.auditService.logEvent(
        AUDIT_EVENT.LOGIN_FAILED,
        undefined,
        ipAddress,
        { email },
      );

      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    if (user.passwordRestRequired) {
      const tokenData = this.generateResetTokenData();
      await this.prisma.resetToken.create({
        data: {
          email: email.toLowerCase(),
          token: tokenData.token,
          expiresAt: tokenData.expiresAt,
        },
      });
      return {
        accessToken: '',
        user: { email: user.email },
        resetRequired: true,
        resetToken: tokenData.token,
      };
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);

    if (!isPasswordValid) {
      await this.failedLoginService.recordFailure(email);
      await this.auditService.logEvent(
        AUDIT_EVENT.LOGIN_FAILED,
        undefined,
        ipAddress,
        { email },
      );
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    await this.failedLoginService.resetFailures(email);

    const payload = {
      username: user.username,
      userID: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    await this.auditService.logEvent(
      AUDIT_EVENT.LOGIN_SUCCESS,
      user.id,
      ipAddress,
    );

    const sessionID = await this.createSession(user.id, user.email);

    return {
      accessToken,
      user,
      sessionID,
      mode: 'base',
      orgId: null,
      roles: [],
      permissions: [],
    };
  }

  async loginUserOrg(userId: number, orgID: string) {
    const membership = await this.prisma.organizationAdmin.findFirst({
      where: {
        userId,
        orgId: orgID,
      },
      select: {
        roles: true,
        organization: {
          select: {
            orgSubscription: {
              select: { plan: { select: { features: true } } },
            },
          },
        },
      },
    });

    const user = await this.usersService.user({
      id: userId,
      accountStatus: 'active',
    });

    if (!membership || !user) {
      throw new ForbiddenException('Not a member of this organization');
    }

    const roles = membership?.roles || [];
    const permissions = this.permissionService.getPermissionsForRoles(roles);
    const features =
      membership?.organization.orgSubscription?.[0]?.plan?.features || [];

    const payload = {
      mode: 'org',
      orgID,
      roles: roles || [],
      permissions,
      userID: userId,
      email: user.email,
      features: features || [],
    };

    const token = await this.jwtService.signAsync(payload);

    console.log('new token: ', token);

    const sessionID = await this.createSession(userId, user.email);

    return {
      accessToken: token,
      user: user,
      sessionID,
    };
  }

  async loginUserByID(id: number, ipAddress?: string) {
    const user = await this.usersService.user({
      id,
      accountStatus: 'active',
    });

    this.logger.debug('loginUserByID', user);

    if (!user) {
      await this.auditService.logEvent(AUDIT_EVENT.LOGIN_FAILED, id, ipAddress);
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const payload = {
      username: user.username,
      userID: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    console.log('new access token', accessToken);

    await this.auditService.logEvent(AUDIT_EVENT.LOGIN_SUCCESS, id, ipAddress);

    const sessionID = await this.createSession(user.id, user.email);

    return {
      accessToken,
      user,
      sessionID,
    };
  }

  async generateResetToken(email: string, ipAddress?: string) {
    const user = await this.usersService.user({ email: email.toLowerCase() });
    if (!user) {
      this.logger.warn('Password reset requested for non-existent email', {
        email,
        ipAddress,
      });
      return true;
    }

    const tokenData = this.generateResetTokenData();
    await this.prisma.resetToken.create({
      data: {
        email: email.toLowerCase(),
        token: tokenData.token,
        expiresAt: tokenData.expiresAt,
      },
    });

    await this.mail.sendResetEmail({
      to: email,
      context: { email, token: tokenData.token },
    });
    await this.auditService.logEvent(
      AUDIT_EVENT.PASSWORD_RESET_REQUESTED,
      undefined,
      ipAddress,
      { email },
    );
    this.logger.verbose('Token Data', { tokenData });
    return true;
  }

  async resetFromToken(
    email: string,
    password: string,
    token: string,
    ipAddress?: string,
  ) {
    const tokenData = await this.prisma.resetToken.findFirst({
      where: {
        email: email.toLowerCase(),
        token,
        expiresAt: { gte: new Date() },
      },
    });

    if (!tokenData) {
      this.logger.warn('No token data');
      return false;
    }

    await this.usersService.updateUser({
      where: { email: email.toLowerCase() },
      data: { password, passwordRestRequired: false },
    });

    await this.auditService.logEvent(
      AUDIT_EVENT.PASSWORD_RESET,
      undefined,
      ipAddress,
      { email },
    );

    await this.prisma.resetToken.delete({
      where: {
        token_email: { token, email: email.toLowerCase() },
      },
    });
    return true;
  }

  async logout(
    ipAddress?: string,
  ): Promise<{ message: string; statusCode: number }> {
    await this.auditService.logEvent(
      AUDIT_EVENT.LOGIN_FAILED,
      undefined,
      ipAddress,
    );
    return {
      message: 'Logout successful',
      statusCode: HttpStatus.OK,
    };
  }

  private generateResetTokenData(): {
    token: string;
    expiresAt: Date;
  } {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

    return { token, expiresAt };
  }
}
