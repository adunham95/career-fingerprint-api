import { Controller, Post, Body } from '@nestjs/common';
import { ThankYousService } from './thank-yous.service';
import { CreateThankYousDto } from './dto/create-thank-yous.dto';

@Controller('thank-yous')
export class ThankYousController {
  constructor(private readonly thankYousService: ThankYousService) {}

  @Post()
  create(@Body() createThankYousDto: CreateThankYousDto) {
    return this.thankYousService.create(createThankYousDto);
  }
}
