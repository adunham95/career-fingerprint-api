import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';

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
      email,
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
        email,
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
      where: { email, token, expiresAt: { gte: new Date() } },
    });

    if (!tokenData) {
      console.log('no token data');
      return false;
    }

    await this.usersService.updateUser({
      where: { email },
      data: { password },
    });

    await this.prisma.resetToken.delete({
      where: {
        token_email: { token, email },
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
