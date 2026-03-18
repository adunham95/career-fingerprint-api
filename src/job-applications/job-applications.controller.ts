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
import { MinPlanLevel } from 'src/decorators/min-plan-level.decorator';
import { SubscriptionGuard } from 'src/auth/subscription.guard';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('job-applications')
export class JobApplicationsController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService,
  ) {}

  @Post()
  @MinPlanLevel(1)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
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
  @MinPlanLevel(1)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  findMy(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.jobApplicationsService.findMyJobApps(req.user.id);
  }

  @Get('my/active')
  @Header('Cache-Control', 'private, max-age=30')
  @MinPlanLevel(1)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  findMyActive(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.jobApplicationsService.findMyActiveJobApps(req.user.id);
  }

  @Get(':id')
  @Header('Cache-Control', 'private, max-age=30')
  @MinPlanLevel(1)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  findOne(@Param('id') id: string) {
    return this.jobApplicationsService.findOne(id);
  }

  @Patch(':id')
  @MinPlanLevel(1)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  update(
    @Param('id') id: string,
    @Body() updateJobApplicationDto: UpdateJobApplicationDto,
  ) {
    return this.jobApplicationsService.update(id, updateJobApplicationDto);
  }

  @Delete(':id')
  @MinPlanLevel(1)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  remove(@Param('id') id: string) {
    return this.jobApplicationsService.remove(id);
  }
}
