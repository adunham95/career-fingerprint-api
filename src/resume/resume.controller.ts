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
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request, Response } from 'express';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findMyResumes(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.resumeService.findMyResumes(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resumeService.findOne(id);
  }

  @Get(':id/pdf')
  async findOneForPDF(@Param('id') id: string, @Res() res: Response) {
    const stream = await this.resumeService.findOneAndBuildPDF(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="resume-${id}.pdf"`);
    return stream.pipe(res);
  }

  @Get(':id/objects')
  getObjectsForResume(@Param('id') id: string) {
    return this.resumeService.findResumeObjects(id);
  }

  @Get(':id/job-positions')
  getJobPositionsForResume(@Param('id') id: string) {
    return this.resumeService.findJobObject(id);
  }

  @Get(':id/education')
  getEducationForResume(@Param('id') id: string) {
    return this.resumeService.findEduObject(id);
  }

  @Get(':id/duplicate')
  duplicateResume(@Param('id') id: string) {
    return this.resumeService.duplicateResume(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateResumeDto: UpdateResumeDto) {
    return this.resumeService.update(id, updateResumeDto);
  }

  @Post(':id/resume-object')
  updateResumeWithJob(
    @Param('id') id: string,
    @Body() createResumeObjectDto: CreateResumeObjectDto,
  ) {
    return this.resumeService.createResumeObject(id, createResumeObjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resumeService.remove(id);
  }
}
