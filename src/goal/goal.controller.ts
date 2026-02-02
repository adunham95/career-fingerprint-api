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
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MinPlanLevel } from 'src/decorators/min-plan-level.decorator';
import { SubscriptionGuard } from 'src/auth/subscription.guard';

@Controller('goal')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Post()
  @MinPlanLevel(2)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  create(@Body() createGoalDto: CreateGoalDto, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    createGoalDto.userID = req.user.id;
    return this.goalService.create(createGoalDto);
  }

  @Get()
  @MinPlanLevel(2)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  findAll() {
    return this.goalService.findAll();
  }

  @Get('my')
  @MinPlanLevel(2)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  findMine(@Req() req: Request, @Query() query: GoalQueryDto) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.goalService.findMine(req.user.id, query);
  }

  @Get('skills')
  @MinPlanLevel(2)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  findSkills() {
    return this.goalService.findGoalSkills();
  }

  @Get('milestone/:id/:type')
  @MinPlanLevel(2)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  findMilestoneItem(@Param('id') id: string, @Param('type') type: string) {
    return this.goalService.getMilestoneDetails(type, id);
  }

  @Patch('milestone/:id/:type')
  @MinPlanLevel(2)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
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
  @MinPlanLevel(2)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  findOne(@Param('id') id: string) {
    return this.goalService.findOne(+id);
  }

  @Patch(':id')
  @MinPlanLevel(2)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  update(@Param('id') id: string, @Body() updateGoalDto: UpdateGoalDto) {
    return this.goalService.update(+id, updateGoalDto);
  }

  @Delete(':id')
  @MinPlanLevel(2)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  remove(@Param('id') id: string) {
    return this.goalService.remove(+id);
  }
}
