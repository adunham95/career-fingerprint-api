import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { GoalService } from './goal.service';
import { CreateGoalDto, GoalQueryDto } from './dto/create-goal.dto';
import { CheckoffMilestoneDto, UpdateGoalDto } from './dto/update-goal.dto';
import { Request } from 'express';
import { HasFeature } from 'src/decorators/has-feature.decorator';
import { FeatureGuard } from 'src/auth/feature.guard';
import { FeatureFlags } from 'src/utils/featureFlags';
import { Cron } from '@nestjs/schedule';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('goal')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Post()
  @HasFeature(FeatureFlags.GoalsCreate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  create(@Body() createGoalDto: CreateGoalDto, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    createGoalDto.userID = req.user.id;
    return this.goalService.create(createGoalDto);
  }

  @Get()
  @HasFeature(FeatureFlags.GoalsRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findAll() {
    return this.goalService.findAll();
  }

  @Get('my')
  @HasFeature(FeatureFlags.GoalsRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findMine(@Req() req: Request, @Query() query: GoalQueryDto) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.goalService.findMine(req.user.id, query);
  }

  /**
   * @deprecated
   */
  @Get('skills')
  @HasFeature(FeatureFlags.GoalsRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findSkills() {
    return this.goalService.findGoalSkills();
  }

  @Get('milestone/:id/:type')
  @HasFeature(FeatureFlags.GoalsRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findMilestoneItem(
    @Param('id') id: string,
    @Param('type') type: string,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.goalService.getMilestoneDetails(
      type,
      id,
      req.user.id,
      req.user.timezone,
    );
  }

  @Patch('milestone/:id/:type')
  @HasFeature(FeatureFlags.GoalsUpdate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  updateMilestoneItem(
    @Param('id') id: string,
    @Body() checkoffItemBody: CheckoffMilestoneDto,
    @Req() req: Request,
    @Param('type') type: string,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.goalService.checkoffMilestone(
      type,
      id,
      req.user.id,
      checkoffItemBody,
    );
  }

  @Get(':id')
  @HasFeature(FeatureFlags.GoalsRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findOne(@Param('id') id: string) {
    return this.goalService.findOne(+id);
  }

  @Patch(':id')
  @HasFeature(FeatureFlags.GoalsUpdate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  update(@Param('id') id: string, @Body() updateGoalDto: UpdateGoalDto) {
    return this.goalService.update(+id, updateGoalDto);
  }

  @Delete(':id')
  @HasFeature(FeatureFlags.GoalsDelete)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  remove(@Param('id') id: string) {
    return this.goalService.remove(+id);
  }

  // Rest the streak counter of goals if they dont have a check in for the week
  @Cron('30 2 * * 0')
  resetStreakCounter() {
    return this.goalService.resetStreakCounter();
  }
}
