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
import { Request } from 'express';
import { HasFeature } from 'src/decorators/has-feature.decorator';
import { FeatureGuard } from 'src/auth/feature.guard';
import { FeatureFlags } from 'src/utils/featureFlags';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('bullet-points')
export class BulletPointsController {
  constructor(private readonly bulletPointsService: BulletPointsService) {}

  @Post()
  @HasFeature(FeatureFlags.BulletPointsCreate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
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
  @HasFeature(FeatureFlags.BulletPointsUpdate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  update(
    @Param('id') id: string,
    @Body() updateBulletPointDto: UpdateBulletPointDto,
  ) {
    return this.bulletPointsService.update(id, updateBulletPointDto);
  }

  @Delete(':id')
  @HasFeature(FeatureFlags.BulletPointsDelete)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  remove(@Param('id') id: string) {
    return this.bulletPointsService.remove(id);
  }
}
