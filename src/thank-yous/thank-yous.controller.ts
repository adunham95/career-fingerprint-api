import {
  Controller,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ThankYousService } from './thank-yous.service';
import { CreateThankYousDto } from './dto/create-thank-yous.dto';
import { Request } from 'express';

@Controller('thank-yous')
export class ThankYousController {
  constructor(private readonly thankYousService: ThankYousService) {}

  @Post()
  create(@Body() createThankYousDto: CreateThankYousDto, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.thankYousService.create(req.user.id, createThankYousDto);
  }
}
