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
import { ResumeService } from './resume.service';
import {
  CreateResumeDto,
  CreateResumeObjectDto,
} from './dto/create-resume.dto';
import {
  UpdateResumeDto,
  UpdateResumeObjectDto,
} from './dto/update-resume.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { HasFeature } from 'src/decorators/has-feature.decorator';
import { FeatureGuard } from 'src/auth/feature.guard';
import { FeatureFlags } from 'src/utils/featureFlags';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post()
  @HasFeature(FeatureFlags.ResumeCreate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  create(@Body() createResumeDto: CreateResumeDto, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    createResumeDto.userID = req.user.id;
    return this.resumeService.create(createResumeDto);
  }

  @Get()
  findAll() {
    return this.resumeService.findAll();
  }

  @Get('my')
  @HasFeature(FeatureFlags.ResumeRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  @ApiBearerAuth()
  findMyResumes(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.resumeService.findMyResumes(req.user.id);
  }

  @Get(':id')
  @HasFeature(FeatureFlags.ResumeRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findOne(@Param('id') id: string) {
    return this.resumeService.findOne(id);
  }

  @Get(':id/pdf')
  @HasFeature(FeatureFlags.ResumeExportPDF)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  async findOneForPDF(@Param('id') id: string, @Res() res: Response) {
    const stream = await this.resumeService.findOneAndBuildPDF(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="resume-${id}.pdf"`);
    return stream.pipe(res);
  }

  @Get(':id/objects')
  @HasFeature(FeatureFlags.ResumeRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  getObjectsForResume(@Param('id') id: string) {
    return this.resumeService.findResumeObjects(id);
  }

  @Get(':id/job-positions')
  @HasFeature(FeatureFlags.ResumeRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  getJobPositionsForResume(@Param('id') id: string) {
    return this.resumeService.findJobObject(id);
  }

  @Get(':id/education')
  @HasFeature(FeatureFlags.ResumeRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  getEducationForResume(@Param('id') id: string) {
    return this.resumeService.findEduObject(id);
  }

  @Get(':id/duplicate')
  @HasFeature(FeatureFlags.ResumeDuplicate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  duplicateResume(@Param('id') id: string) {
    return this.resumeService.duplicateResume(id);
  }

  @Patch(':id')
  @HasFeature(FeatureFlags.ResumeUpdate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  update(@Param('id') id: string, @Body() updateResumeDto: UpdateResumeDto) {
    return this.resumeService.update(id, updateResumeDto);
  }

  @Post(':id/resume-object')
  @HasFeature(FeatureFlags.ResumeCreate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  createResumeObject(
    @Param('id') id: string,
    @Body() createResumeObjectDto: CreateResumeObjectDto,
  ) {
    return this.resumeService.createResumeObject(id, createResumeObjectDto);
  }

  @Patch('resume-object/:objID')
  @HasFeature(FeatureFlags.ResumeUpdate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  updateResumeWithJob(
    @Param('objID') resumeObjectID: string,
    @Body() createResumeObjectDto: UpdateResumeObjectDto,
  ) {
    return this.resumeService.updateResumeObject(
      resumeObjectID,
      createResumeObjectDto,
    );
  }

  @Delete(':id')
  @HasFeature(FeatureFlags.ResumeDelete)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  remove(@Param('id') id: string) {
    return this.resumeService.remove(id);
  }

  @Delete('resume-object/:objID')
  @HasFeature(FeatureFlags.ResumeDelete)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  removeJobObject(@Param('objID') id: string) {
    return this.resumeService.removeJobObject(id);
  }
}
