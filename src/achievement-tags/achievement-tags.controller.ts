import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  Query,
  Header,
} from '@nestjs/common';
import { AchievementTagsService } from './achievement-tags.service';
import { CreateAchievementTagDto } from './dto/create-achievement-tag.dto';
import { Request } from 'express';
import { HasFeature } from 'src/decorators/has-feature.decorator';
import { FeatureGuard } from 'src/auth/feature.guard';
import { FeatureFlags } from 'src/utils/featureFlags';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('achievement-tags')
export class AchievementTagsController {
  constructor(
    private readonly achievementTagsService: AchievementTagsService,
  ) {}

  @Post()
  @HasFeature(FeatureFlags.AchievementTagsCreate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  create(
    @Req() req: Request,
    @Body() createAchievementTagDto: CreateAchievementTagDto,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    createAchievementTagDto.userID = req.user.id;
    return this.achievementTagsService.create(createAchievementTagDto);
  }

  @Get()
  @HasFeature(FeatureFlags.AchievementTagsRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findAll(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.achievementTagsService.findAll(req.user.id);
  }

  @Get('autocomplete')
  @HasFeature(FeatureFlags.AchievementTagsRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findAutocomplete(
    @Query('query') query: string,
    @Query('limit') limit = 10,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.achievementTagsService.findByName(req.user.id, query, limit);
  }

  @Get(':id')
  @Header('Cache-Control', 'private, max-age=30')
  @HasFeature(FeatureFlags.AchievementTagsRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findOne(@Param('id') id: string) {
    return this.achievementTagsService.findOne(+id);
  }

  @Patch(':id')
  @HasFeature(FeatureFlags.AchievementTagsUpdate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  update(
    @Param('id') id: string,
    // @Body() updateAchievementTagDto: UpdateAchievementTagDto,
  ) {
    // return this.achievementTagsService.update(+id, updateAchievementTagDto);
    return this.achievementTagsService.update(+id);
  }

  @Patch(':id/ach/:achievement_id')
  @HasFeature(FeatureFlags.AchievementTagsUpdate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  linkToAchievementID(
    @Param('id') id: string,
    @Param('achievement_id') achievement_id: string,
  ) {
    return this.achievementTagsService.linkToAchievementID(id, achievement_id);
  }

  @Delete(':id')
  @HasFeature(FeatureFlags.AchievementTagsDelete)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  remove(@Param('id') id: string) {
    return this.achievementTagsService.remove(+id);
  }
}
