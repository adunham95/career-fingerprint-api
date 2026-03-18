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
import { MinPlanLevel } from 'src/decorators/min-plan-level.decorator';
import { SubscriptionGuard } from 'src/auth/subscription.guard';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('achievement-tags')
export class AchievementTagsController {
  constructor(
    private readonly achievementTagsService: AchievementTagsService,
  ) {}

  @Post()
  @MinPlanLevel(1)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
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
  @MinPlanLevel(1)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  findAll(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.achievementTagsService.findAll(req.user.id);
  }

  @Get('autocomplete')
  @MinPlanLevel(1)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
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
  @MinPlanLevel(1)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  findOne(@Param('id') id: string) {
    return this.achievementTagsService.findOne(+id);
  }

  @Patch(':id')
  @MinPlanLevel(1)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  update(
    @Param('id') id: string,
    // @Body() updateAchievementTagDto: UpdateAchievementTagDto,
  ) {
    // return this.achievementTagsService.update(+id, updateAchievementTagDto);
    return this.achievementTagsService.update(+id);
  }

  @Patch(':id/ach/:achievement_id')
  @MinPlanLevel(1)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  linkToAchievementID(
    @Param('id') id: string,
    @Param('achievement_id') achievement_id: string,
  ) {
    return this.achievementTagsService.linkToAchievementID(id, achievement_id);
  }

  @Delete(':id')
  @MinPlanLevel(1)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  remove(@Param('id') id: string) {
    return this.achievementTagsService.remove(+id);
  }
}
