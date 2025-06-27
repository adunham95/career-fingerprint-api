import { Controller, Post, Body, Res } from '@nestjs/common';
import { RegisterService } from './register.service';
import { CreateRegisterDto } from './dto/create-register.dto';
import { AuthService } from 'src/auth/auth.service';
import { Response } from 'express';

@Controller('register')
export class RegisterController {
  constructor(
    private readonly registerService: RegisterService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async create(
    @Body() createRegisterDto: CreateRegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.registerService.registerNewUser(createRegisterDto);

    const { accessToken } = await this.authService.loginUser(
      user.email,
      createRegisterDto.password,
    );

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 day
    });
    return { accessToken, user };
  }
}
