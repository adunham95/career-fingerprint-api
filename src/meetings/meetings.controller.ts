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
  Res,
  Header,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  MeetingQueryDto,
  SingleMeetingQueryDto,
} from './dto/meeting-query.dto';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createMeetingDto: CreateMeetingDto, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    createMeetingDto.userID = req.user.id;
    return this.meetingsService.create(createMeetingDto);
  }

  @Get()
  findAll() {
    return this.meetingsService.findAll();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'private, max-age=30')
  findMine(@Req() req: Request, @Query() query: MeetingQueryDto) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.meetingsService.findMine(req.user.id, query);
  }

  @Get('my/upcoming')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'private, max-age=10')
  findMineUpcoming(@Req() req: Request, @Query() query: MeetingQueryDto) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.meetingsService.findMineUpcoming(req.user.id, query);
  }

  @Get('my/previous')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'private, max-age=10')
  findMinePrevious(@Req() req: Request, @Query() query: MeetingQueryDto) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.meetingsService.findMinePrevious(req.user.id, query);
  }

  @Get('job-application/:id')
  @UseGuards(JwtAuthGuard)
  findRelatedToJobApplication(@Param('id') id: string) {
    return this.meetingsService.findRelatedToJob(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'private, max-age=30')
  findOne(@Param('id') id: string, @Query() query: SingleMeetingQueryDto) {
    return this.meetingsService.findOne(id, query);
  }

  @Get(':id/pdf')
  @UseGuards(JwtAuthGuard)
  async findOnePrepPdfDoc(@Param('id') id: string, @Res() res: Response) {
    const stream = await this.meetingsService.getPrepDocPdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="check-sheet-${id}.pdf"`,
    );
    return stream.pipe(res);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMeetingDto: UpdateMeetingDto) {
    return this.meetingsService.update(id, updateMeetingDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.meetingsService.remove(id);
  }
}
