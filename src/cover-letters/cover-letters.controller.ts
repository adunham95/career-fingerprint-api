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
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request, Response } from 'express';

@Controller('cover-letters')
export class CoverLettersController {
  constructor(private readonly coverLettersService: CoverLettersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  findMine() {
    return this.coverLettersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coverLettersService.findOne(id);
  }

  @Get('jobApp/:jobAppID')
  @UseGuards(JwtAuthGuard)
  findOneWithJob(@Param('jobAppID') id: string) {
    return this.coverLettersService.findOneFromJob(id);
  }

  @Get('jobApp/:jobAppID/pdf')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateCoverLetterDto: UpdateCoverLetterDto,
  ) {
    return this.coverLettersService.update(id, updateCoverLetterDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.coverLettersService.remove(id);
  }
}
