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
  Res,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Request, Response } from 'express';
import { MinPlanLevel } from 'src/decorators/min-plan-level.decorator';
import { SubscriptionGuard } from 'src/auth/subscription.guard';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @MinPlanLevel(2)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  create(@Body() createNoteDto: CreateNoteDto, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    createNoteDto.userID = req.user.id;
    return this.notesService.create(createNoteDto);
  }

  @Get()
  findAll() {
    return this.notesService.findAll();
  }

  @Get('my')
  @MinPlanLevel(2)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  findMyNotes(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.notesService.findMy(req.user.id);
  }

  @Get('job-application/:id')
  @MinPlanLevel(2)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  findJobAppNotes(@Param('id') id: string, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.notesService.findByJobApplication(id);
  }

  @Get('meeting/:id')
  @MinPlanLevel(2)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  findMeetingNOtes(@Param('id') id: string) {
    return this.notesService.findByMeeting(id);
  }

  @Get('meeting/:id/pdf')
  @MinPlanLevel(2)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  async findOneNotesPdfDoc(@Param('id') id: string, @Res() res: Response) {
    const stream = await this.notesService.getMeetingNotesDocPdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${id}-notes.pdf"`);
    return stream.pipe(res);
  }

  @Get(':id')
  @MinPlanLevel(2)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  findOne(@Param('id') id: string) {
    return this.notesService.findOne(+id);
  }

  @Patch(':id')
  @MinPlanLevel(2)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    return this.notesService.update(id, updateNoteDto);
  }

  @Delete(':id')
  @MinPlanLevel(2)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  remove(@Param('id') id: string) {
    return this.notesService.remove(id);
  }
}
