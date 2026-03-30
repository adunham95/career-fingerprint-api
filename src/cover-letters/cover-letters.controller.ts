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
  Res,
} from '@nestjs/common';
import { CoverLettersService } from './cover-letters.service';
import { CreateCoverLetterDto } from './dto/create-cover-letter.dto';
import { UpdateCoverLetterDto } from './dto/update-cover-letter.dto';
import { Request, Response } from 'express';
import { HasFeature } from 'src/decorators/has-feature.decorator';
import { FeatureGuard } from 'src/auth/feature.guard';
import { FeatureFlags } from 'src/utils/featureFlags';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('cover-letters')
export class CoverLettersController {
  constructor(private readonly coverLettersService: CoverLettersService) {}

  @Post()
  @HasFeature(FeatureFlags.CoverLetterCreate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  create(
    @Body() createCoverLetterDto: CreateCoverLetterDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    createCoverLetterDto.userID = req.user.id;
    return this.coverLettersService.create(createCoverLetterDto);
  }

  @Get()
  findAll() {
    return this.coverLettersService.findAll();
  }

  @Get('my')
  @HasFeature(FeatureFlags.CoverLetterRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findMine() {
    return this.coverLettersService.findAll();
  }

  @Get(':id')
  @HasFeature(FeatureFlags.CoverLetterRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findOne(@Param('id') id: string) {
    return this.coverLettersService.findOne(id);
  }

  @Get('jobApp/:jobAppID')
  @HasFeature(FeatureFlags.CoverLetterRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findOneWithJob(@Param('jobAppID') id: string) {
    return this.coverLettersService.findOneFromJob(id);
  }

  @Get('jobApp/:jobAppID/pdf')
  @HasFeature(FeatureFlags.CoverLetterDownload)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  async findOneWithJobMakePDF(
    @Param('jobAppID') id: string,
    @Res() res: Response,
  ) {
    const stream = await this.coverLettersService.findOneFromJobBuildPDF(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="resume-${id}.pdf"`);
    return stream.pipe(res);
  }

  @Patch('jobApp/:jobAppID')
  @HasFeature(FeatureFlags.CoverLetterUpdate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  patch(
    @Param('jobAppID') id: string,
    @Body() createCoverLetterDto: CreateCoverLetterDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    createCoverLetterDto.userID = req.user.id;
    return this.coverLettersService.upsert(id, createCoverLetterDto);
  }

  @Patch(':id')
  @HasFeature(FeatureFlags.CoverLetterUpdate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  update(
    @Param('id') id: string,
    @Body() updateCoverLetterDto: UpdateCoverLetterDto,
  ) {
    return this.coverLettersService.update(id, updateCoverLetterDto);
  }

  @Delete(':id')
  @HasFeature(FeatureFlags.CoverLetterDelete)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  remove(@Param('id') id: string) {
    return this.coverLettersService.remove(id);
  }
}
