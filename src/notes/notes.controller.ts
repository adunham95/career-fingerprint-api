import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
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

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  findMyNotes(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.notesService.findMy(req.user.id);
  }

  @Get('job-application/:id')
  @UseGuards(JwtAuthGuard)
  findJobAppNotes(@Param('id') id: string, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.notesService.findByJobApplication(id);
  }

  @Get('meeting/:id')
  @UseGuards(JwtAuthGuard)
  findMeetingNOtes(@Param('id') id: string) {
    return this.notesService.findByMeeting(id);
  }

  @Get('meeting/:id/pdf')
  @UseGuards(JwtAuthGuard)
  async findOneNotesPdfDoc(@Param('id') id: string, @Res() res: Response) {
    const stream = await this.notesService.getMeetingNotesDocPdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${id}-notes.pdf"`);
    return stream.pipe(res);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    return this.notesService.update(id, updateNoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notesService.remove(id);
  }
}
