import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { FailedLoginService } from './failed-login.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mail: MailService,
    private failedLoginService: FailedLoginService,
  ) {}

  async loginUser(email: string, pass: string) {
    if (await this.failedLoginService.isBlocked(email)) {
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

      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);

    if (!isPasswordValid) {
      await this.failedLoginService.recordFailure(email);
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    await this.failedLoginService.resetFailures(email);

    const payload = {
      username: user.username,
      userID: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user,
    };
  }

  async loginUserByID(id: number) {
    const user = await this.usersService.user({
      id,
      accountStatus: 'active',
    });

    this.logger.debug('loginUserByID', user);

    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const payload = {
      username: user.username,
      userID: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user,
    };
  }

  async generateResetToken(email: string) {
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
    this.logger.verbose('Token Data', { tokenData });
    return true;
  }

  async resetFromToken(email: string, password: string, token: string) {
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
      data: { password },
    });

    await this.prisma.resetToken.delete({
      where: {
        token_email: { token, email: email.toLowerCase() },
      },
    });
    return true;
  }

  logout(): { message: string; statusCode: number } {
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
