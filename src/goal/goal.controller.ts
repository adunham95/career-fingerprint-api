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
import { UpdateGoalDto } from './dto/update-goal.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('goal')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createGoalDto: CreateGoalDto, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    createGoalDto.userID = req.user.id;
    return this.goalService.create(createGoalDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.goalService.findAll();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMine(@Req() req: Request, @Query() query: GoalQueryDto) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.goalService.findMine(req.user.id, query);
  }

  @Get('skills')
  findSkills() {
    return this.goalService.findGoalSkills();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.goalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGoalDto: UpdateGoalDto) {
    return this.goalService.update(+id, updateGoalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.goalService.remove(+id);
  }
}
