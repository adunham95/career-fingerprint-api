import {
  Body,
  Controller,
  Get,
  Header,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { SkillListService } from './skill-list.service';
import { HasFeature } from 'src/decorators/has-feature.decorator';
import { FeatureGuard } from 'src/auth/feature.guard';
import { FeatureFlags } from 'src/utils/featureFlags';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('skill-list')
export class SkillListController {
  constructor(private readonly skillListService: SkillListService) {}

  @Post()
  @HasFeature(FeatureFlags.SkillsEdit)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  upsertSkillList(
    @Body() skillListDto: { skillList: string[] },
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.skillListService.upsertSkillList(
      req.user.id,
      skillListDto.skillList,
    );
  }

  @Get('/my')
  @HasFeature(FeatureFlags.SkillsRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  @Header('Cache-Control', 'private, max-age=30')
  mySkillList(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.skillListService.mySkillList(req.user.id);
  }
}
