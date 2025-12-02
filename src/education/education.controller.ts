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
import { EducationService } from './education.service';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RequirePermission } from 'src/permission/permission.decorator';
import { OrgMemberGuard } from 'src/org/org-admin.guard';
import { PermissionGuard } from 'src/permission/permission.guard';

@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createEducationDto: CreateEducationDto, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    createEducationDto.userID = req.user.id;
    return this.educationService.create(createEducationDto);
  }

  @Post('client/:userID')
  @RequirePermission('career:edit')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  createClient(
    @Body() createEducationDto: CreateEducationDto,
    @Req() req: Request,
    @Param('userID') userID: string,
  ) {
    createEducationDto.userID = +userID;
    return this.educationService.create(createEducationDto);
  }

  @Get()
  findAll() {
    return this.educationService.findAll();
  }

  @Get('my')
  @Header('Cache-Control', 'private, max-age=30')
  @UseGuards(JwtAuthGuard)
  findMyEducation(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    return this.educationService.findMyEducation(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'private, max-age=30')
  findOne(@Param('id') id: string) {
    return this.educationService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateEducationDto: UpdateEducationDto,
  ) {
    return this.educationService.update(id, updateEducationDto);
  }

  @Patch(':id/client/:userID')
  @RequirePermission('career:edit')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  updateClient(
    @Param('id') id: string,
    @Body() updateEducationDto: UpdateEducationDto,
  ) {
    return this.educationService.update(id, updateEducationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.educationService.remove(id);
  }

  @Delete(':id/client/:userID')
  @RequirePermission('career:edit')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  removeClientObject(@Param('id') id: string) {
    return this.educationService.remove(id);
  }
}
