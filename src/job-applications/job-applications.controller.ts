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
  Header,
} from '@nestjs/common';
import { JobApplicationsService } from './job-applications.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { Request } from 'express';
import { HasFeature } from 'src/decorators/has-feature.decorator';
import { FeatureGuard } from 'src/auth/feature.guard';
import { FeatureFlags } from 'src/utils/featureFlags';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('job-applications')
export class JobApplicationsController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService,
  ) {}

  @Post()
  @HasFeature(FeatureFlags.JobAppCreate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  create(
    @Body() createJobApplicationDto: CreateJobApplicationDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    createJobApplicationDto.userID = req.user.id;
    return this.jobApplicationsService.create(createJobApplicationDto);
  }

  @Get()
  findAll() {
    return this.jobApplicationsService.findAll();
  }

  @Get('my')
  @Header('Cache-Control', 'private, max-age=30')
  @HasFeature(FeatureFlags.JobAppRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findMy(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.jobApplicationsService.findMyJobApps(req.user.id);
  }

  @Get('my/active')
  @Header('Cache-Control', 'private, max-age=30')
  @HasFeature(FeatureFlags.JobAppRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findMyActive(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.jobApplicationsService.findMyActiveJobApps(req.user.id);
  }

  @Get(':id')
  @Header('Cache-Control', 'private, max-age=30')
  @HasFeature(FeatureFlags.JobAppRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findOne(@Param('id') id: string) {
    return this.jobApplicationsService.findOne(id);
  }

  @Patch(':id')
  @HasFeature(FeatureFlags.JobAppUpdate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  update(
    @Param('id') id: string,
    @Body() updateJobApplicationDto: UpdateJobApplicationDto,
  ) {
    return this.jobApplicationsService.update(id, updateJobApplicationDto);
  }

  @Delete(':id')
  @HasFeature(FeatureFlags.JobAppDelete)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  remove(@Param('id') id: string) {
    return this.jobApplicationsService.remove(id);
  }
}
