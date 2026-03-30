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
import { HasFeature } from 'src/decorators/has-feature.decorator';
import { FeatureGuard } from 'src/auth/feature.guard';
import { FeatureFlags } from 'src/utils/featureFlags';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @HasFeature(FeatureFlags.NotesCreate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
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
  @HasFeature(FeatureFlags.NotesRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findMyNotes(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.notesService.findMy(req.user.id);
  }

  @Get('job-application/:id')
  @HasFeature(FeatureFlags.NotesRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findJobAppNotes(@Param('id') id: string, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.notesService.findByJobApplication(id);
  }

  @Get('meeting/:id')
  @HasFeature(FeatureFlags.NotesRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findMeetingNOtes(@Param('id') id: string) {
    return this.notesService.findByMeeting(id);
  }

  @Get('meeting/:id/pdf')
  @HasFeature(FeatureFlags.MeetingNotesDownload)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  async findOneNotesPdfDoc(@Param('id') id: string, @Res() res: Response) {
    const stream = await this.notesService.getMeetingNotesDocPdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${id}-notes.pdf"`);
    return stream.pipe(res);
  }

  @Get(':id')
  @HasFeature(FeatureFlags.NotesRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findOne(@Param('id') id: string) {
    return this.notesService.findOne(+id);
  }

  @Patch(':id')
  @HasFeature(FeatureFlags.NotesUpdate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    return this.notesService.update(id, updateNoteDto);
  }

  @Delete(':id')
  @HasFeature(FeatureFlags.NotesDelete)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  remove(@Param('id') id: string) {
    return this.notesService.remove(id);
  }
}
