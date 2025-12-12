import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { HighlightsService } from './highlights.service';
import { CreateHighlightDto } from './dto/create-highlight.dto';
import { UpdateHighlightDto } from './dto/update-highlight.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MinPlanLevel } from 'src/decorators/min-plan-level.decorator';
import { SubscriptionGuard } from 'src/auth/subscription.guard';

@Controller('highlights')
export class HighlightsController {
  constructor(private readonly highlightsService: HighlightsService) {}

  @Post()
  @MinPlanLevel(2)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  create(@Body() createHighlightDto: CreateHighlightDto, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    createHighlightDto.userID = req.user.id;
    return this.highlightsService.create(createHighlightDto);
  }

  @Get()
  findAll() {
    return this.highlightsService.findAll();
  }

  @Get(':id')
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  findOne(@Param('id') id: string) {
    return this.highlightsService.findOne(+id);
  }

  @Get('meeting/:id')
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  findForMeeting(@Param('id') id: string) {
    return this.highlightsService.findForMeeting(id);
  }

  @Patch(':id')
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  update(
    @Param('id') id: string,
    @Body() updateHighlightDto: UpdateHighlightDto,
  ) {
    return this.highlightsService.update(id, updateHighlightDto);
  }

  @Delete(':id')
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  remove(@Param('id') id: string) {
    return this.highlightsService.remove(id);
  }
}
