import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Req,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { SseService } from './sse.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('sse')
export class SseController {
  constructor(private readonly sse: SseService) {}

  @Sse('events')
  @UseGuards(JwtAuthGuard)
  events(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    const userId = req.user?.id; // or req.user.userID depending on your payload
    return this.sse.connectUser(userId);
  }

  @Get('/test/:userID')
  test(@Param('userID') id: string) {
    this.sse.emitToUser(+id, {
      type: 'success',
      message: 'Goal updated',
      details: 'You earned 3 points!',
    });
  }
}
