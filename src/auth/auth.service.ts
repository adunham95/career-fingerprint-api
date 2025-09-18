import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { User } from '@prisma/client';
import { refreshSecret, sessionSecret } from './auth.module';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async loginUser(email: string, pass: string) {
    const user = await this.usersService.user({
      email: email.toLowerCase(),
      accountStatus: 'active',
    });

    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);

    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const payload = {
      userID: user.id,
    };

    const accessToken = this.jwtService.sign(payload);

    const { sessionToken, refreshToken } = this.generateTokens(user);

    return {
      accessToken,
      user,
      sessionToken,
      refreshToken,
    };
  }

  async loginUserByID(id: number) {
    const user = await this.usersService.user({
      id,
      accountStatus: 'active',
    });

    console.log('loginUserByID', user);

    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const accessToken = this.jwtService.sign({
      userID: user.id,
    });

    const { sessionToken, refreshToken } = this.generateTokens(user);

    return {
      accessToken,
      user,
      sessionToken,
      refreshToken,
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
    console.log(tokenData.token);
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
      console.log('no token data');
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

  private generateTokens(user: User) {
    const payload = {
      userID: user.id,
    };

    const sessionToken = this.jwtService.sign(payload, {
      secret: sessionSecret,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: '7d',
    });

    return { refreshToken, sessionToken, user };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload: { userID: number } = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });

      const user = await this.usersService.user({
        id: payload.userID,
        accountStatus: 'active',
      });

      if (!user) throw new Error('User not found');

      const tokens = this.generateTokens(user);

      console.log('tokens', tokens);

      return tokens;
    } catch (e) {
      console.log(e);
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }
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
