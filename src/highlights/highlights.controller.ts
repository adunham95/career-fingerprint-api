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
import { HasFeature } from 'src/decorators/has-feature.decorator';
import { FeatureGuard } from 'src/auth/feature.guard';
import { FeatureFlags } from 'src/utils/featureFlags';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('highlights')
export class HighlightsController {
  constructor(private readonly highlightsService: HighlightsService) {}

  @Post()
  @HasFeature(FeatureFlags.HighlightsCreate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
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
  @HasFeature(FeatureFlags.HighlightsView)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findOne(@Param('id') id: string) {
    return this.highlightsService.findOne(+id);
  }

  @Get('meeting/:id')
  @HasFeature(FeatureFlags.HighlightsView)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findForMeeting(@Param('id') id: string) {
    return this.highlightsService.findForMeeting(id);
  }

  @Patch(':id')
  @HasFeature(FeatureFlags.HighlightsCreate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  update(
    @Param('id') id: string,
    @Body() updateHighlightDto: UpdateHighlightDto,
  ) {
    return this.highlightsService.update(id, updateHighlightDto);
  }

  @Delete(':id')
  @HasFeature(FeatureFlags.HighlightsCreate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  remove(@Param('id') id: string) {
    return this.highlightsService.remove(id);
  }
}
