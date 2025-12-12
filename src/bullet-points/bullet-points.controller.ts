import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BulletPointsService } from './bullet-points.service';
import { CreateBulletPointDto } from './dto/create-bullet-point.dto';
import { UpdateBulletPointDto } from './dto/update-bullet-point.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
import { MinPlanLevel } from 'src/decorators/min-plan-level.decorator';
import { SubscriptionGuard } from 'src/auth/subscription.guard';

@Controller('bullet-points')
export class BulletPointsController {
  constructor(private readonly bulletPointsService: BulletPointsService) {}

  @Post()
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  create(
    @Body() createBulletPointDto: CreateBulletPointDto,
    @Req() req: Request,
  ) {
    console.log('createBulletPoint', createBulletPointDto);
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    createBulletPointDto.userID = req.user.id;
    return this.bulletPointsService.create(createBulletPointDto);
  }

  @Patch(':id')
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  update(
    @Param('id') id: string,
    @Body() updateBulletPointDto: UpdateBulletPointDto,
  ) {
    return this.bulletPointsService.update(id, updateBulletPointDto);
  }

  @Delete(':id')
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  remove(@Param('id') id: string) {
    return this.bulletPointsService.remove(id);
  }
}
