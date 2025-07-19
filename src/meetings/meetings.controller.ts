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
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { Request } from 'express';
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
  findMine(@Req() req: Request, @Query() query: MeetingQueryDto) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.meetingsService.findMine(req.user.id, query);
  }

  @Get('my/upcoming')
  @UseGuards(JwtAuthGuard)
  findMineUpcoming(@Req() req: Request, @Query() query: MeetingQueryDto) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.meetingsService.findMineUpcoming(req.user.id, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Query() query: SingleMeetingQueryDto) {
    return this.meetingsService.findOne(id, query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMeetingDto: UpdateMeetingDto) {
    return this.meetingsService.update(id, updateMeetingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.meetingsService.remove(+id);
  }
}
