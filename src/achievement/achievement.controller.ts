import { SubscriptionGuard } from './../auth/subscription.guard';
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
  Res,
} from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PaginationQueryDto } from 'src/dto/default-pagination-query.dto';
import { PdfService } from 'src/pdf/pdf.service';
import { MinPlanLevel } from 'src/decorators/min-plan-level.decorator';

interface MyAchievementQuery extends PaginationQueryDto {
  includeLinked?: string;
  jobPositionID?: string;
  educationID?: string;
  tagID?: string;
  startDate?: string;
  endDate?: string;
}
@Controller('achievement')
export class AchievementController {
  constructor(
    private readonly achievementService: AchievementService,
    private pdfService: PdfService,
  ) {}

  @Post()
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @ApiBearerAuth()
  create(
    @Body() createAchievementDto: CreateAchievementDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    createAchievementDto.userID = req.user.id;
    return this.achievementService.create(createAchievementDto);
  }

  @Get()
  findAll() {
    return this.achievementService.findAll();
  }

  @Get('my')
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @Header('Cache-Control', 'private, max-age=30')
  findMyAchievements(@Req() req: Request, @Query() query: MyAchievementQuery) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.achievementService.findMy(
      req.user.id,
      {
        jobPositionID: query.jobPositionID || null,
        educationID: query.educationID || null,
        tagID: query.tagID || null,
        startDate: query.startDate || null,
        endDate: query.endDate || null,
      },
      query.includeLinked === 'true',
      { limit: query.limit, page: query.page },
    );
  }

  @Get('my/pdf')
  @MinPlanLevel(2)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @Header('Cache-Control', 'private, max-age=30')
  async getMyAchievementsPDF(
    @Req() req: Request,
    @Query() query: MyAchievementQuery,
    @Res() res: Response,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    const myAchievements = await this.achievementService.findMy(
      req.user.id,
      {
        jobPositionID: query.jobPositionID || null,
        educationID: query.educationID || null,
        tagID: query.tagID || null,
        startDate: query.startDate || null,
        endDate: query.endDate || null,
      },
      true,
      { limit: query.limit, page: query.page },
    );

    const stream = this.pdfService.createAchievementTimeline(myAchievements);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="my-achievements.pdf"`,
    );
    return stream.pipe(res);
  }

  //Org Admin Guard
  @Get('my/:userID')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'private, max-age=30')
  findMyAchievementsByUser(
    @Req() req: Request,
    @Param('userID') id: string,
    @Query() query: MyAchievementQuery,
  ) {
    return this.achievementService.findMy(
      +id,
      {
        jobPositionID: query.jobPositionID || null,
        educationID: query.educationID || null,
        tagID: query.tagID || null,
        startDate: query.startDate || null,
        endDate: query.endDate || null,
      },
      query.includeLinked === 'true',
      { limit: query.limit, page: query.page },
    );
  }

  @Get(':id')
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @Header('Cache-Control', 'private, max-age=30')
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.achievementService.findOne(id);
  }
  @Patch(':id')
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() updateAchievementDto: UpdateAchievementDto,
  ) {
    return this.achievementService.update(id, updateAchievementDto);
  }

  @Delete(':id')
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.achievementService.remove(id);
  }
}
