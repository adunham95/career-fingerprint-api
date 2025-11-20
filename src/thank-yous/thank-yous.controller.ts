import {
  Controller,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ThankYousService } from './thank-yous.service';
import { CreateThankYousDto } from './dto/create-thank-yous.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('thank-yous')
export class ThankYousController {
  constructor(private readonly thankYousService: ThankYousService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createThankYousDto: CreateThankYousDto, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.thankYousService.create(req.user, createThankYousDto);
  }
}
