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
  Header,
} from '@nestjs/common';
import { JobPositionsService } from './job-positions.service';
import { CreateJobPositionDto } from './dto/create-job-position.dto';
import { UpdateJobPositionDto } from './dto/update-job-position.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
import { RequirePermission } from 'src/permission/permission.decorator';
import { OrgMemberGuard } from 'src/org/org-admin.guard';
import { PermissionGuard } from 'src/permission/permission.guard';

@Controller('job-positions')
export class JobPositionsController {
  constructor(private readonly jobPositionsService: JobPositionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @Body() createJobPositionDto: CreateJobPositionDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    createJobPositionDto.userID = req.user.id;
    return this.jobPositionsService.create(createJobPositionDto);
  }

  @Post('client/:userID')
  @RequirePermission('career:edit')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  createForClient(
    @Body() createJobPositionDto: CreateJobPositionDto,
    @Param('userID') userID: string,
  ) {
    createJobPositionDto.userID = +userID;
    console.log({ createJobPositionDto });
    return this.jobPositionsService.create(createJobPositionDto);
  }

  // @Post(':id/bullet-point')
  // @UseGuards(JwtAuthGuard)
  // createBulletPoint(
  //   @Body() createBulletPointDto: CreateBulletPointDto,
  //   @Req() req: Request,
  // ) {
  //   if (!req.user) {
  //     throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
  //   }
  //   createBulletPointDto.userID = req.user.id;
  //   createBulletPointDto.jobPositionID = req.params.id;
  //   return this.jobPositionsService.createBulletPoint(createBulletPointDto);
  // }

  @Post('application')
  @UseGuards(JwtAuthGuard)
  createFromApplications(
    @Req() req: Request,
    @Body() { appID }: { appID: string },
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.jobPositionsService.createFromJobApplication(
      req.user.id,
      appID,
    );
  }

  @Get()
  findAll() {
    return this.jobPositionsService.findAll();
  }

  @Get('my')
  @Header('Cache-Control', 'private, max-age=30')
  @UseGuards(JwtAuthGuard)
  async findMyJobs(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    return this.jobPositionsService.findMyJobPositions(req.user?.id);
  }

  @Get(':id')
  @Header('Cache-Control', 'private, max-age=30')
  findOne(@Param('id') id: string) {
    return this.jobPositionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateJobPositionDto: UpdateJobPositionDto,
  ) {
    return this.jobPositionsService.update(id, updateJobPositionDto);
  }

  @Patch(':id/client/:userID')
  @RequirePermission('career:edit')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  updateClient(
    @Param('id') id: string,
    @Body() updateJobPositionDto: UpdateJobPositionDto,
  ) {
    return this.jobPositionsService.update(id, updateJobPositionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobPositionsService.remove(id);
  }

  @Delete(':id/client/:userID')
  @RequirePermission('career:edit')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  removeUser(@Param('id') id: string) {
    return this.jobPositionsService.remove(id);
  }

  @Delete('bullet-point/:id')
  removeBulletPoint(@Param('id') id: string) {
    return this.jobPositionsService.removeBulletPoint(id);
  }
}
