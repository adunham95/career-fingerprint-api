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
import { AuditService } from 'src/audit/audit.service';
import { AUDIT_EVENT } from 'src/audit/auditEvents';
import { MinPlanLevel } from 'src/decorators/min-plan-level.decorator';
import { SubscriptionGuard } from 'src/auth/subscription.guard';

@Controller('job-positions')
export class JobPositionsController {
  constructor(
    private readonly jobPositionsService: JobPositionsService,
    private auditService: AuditService,
  ) {}

  @Post()
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
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
  async createForClient(
    @Body() createJobPositionDto: CreateJobPositionDto,
    @Param('userID') userID: string,
    @Req() req: Request,
  ) {
    await this.auditService.logEvent(
      AUDIT_EVENT.ADMIN_EDITED_DATA,
      undefined,
      undefined,
      { admin: req.user?.id, client: userID, type: 'addedJobPosition' },
    );
    createJobPositionDto.userID = +userID;
    console.log({ createJobPositionDto });
    return this.jobPositionsService.create(createJobPositionDto);
  }

  @Post('application')
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
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
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async findMyJobs(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    return this.jobPositionsService.findMyJobPositions(req.user?.id);
  }

  @Get(':id')
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @Header('Cache-Control', 'private, max-age=30')
  findOne(@Param('id') id: string) {
    return this.jobPositionsService.findOne(id);
  }

  @Patch(':id')
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  update(
    @Param('id') id: string,
    @Body() updateJobPositionDto: UpdateJobPositionDto,
  ) {
    return this.jobPositionsService.update(id, updateJobPositionDto);
  }

  @Patch(':id/client/:userID')
  @RequirePermission('career:edit')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  async updateClient(
    @Param('id') id: string,
    @Param('userID') userID: string,
    @Body() updateJobPositionDto: UpdateJobPositionDto,
    @Req() req: Request,
  ) {
    await this.auditService.logEvent(
      AUDIT_EVENT.ADMIN_EDITED_DATA,
      undefined,
      undefined,
      {
        admin: req.user?.id,
        client: userID,
        type: 'updatedJobPosition',
        id: id,
      },
    );
    return this.jobPositionsService.update(userID, updateJobPositionDto);
  }

  @Delete(':id')
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.jobPositionsService.remove(id, req.user?.id);
  }

  @Delete(':id/client/:userID')
  @RequirePermission('career:edit')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  async removeUser(
    @Param('id') id: string,
    @Param('userID') userID: string,
    @Req() req: Request,
  ) {
    await this.auditService.logEvent(
      AUDIT_EVENT.ADMIN_EDITED_DATA,
      undefined,
      undefined,
      {
        admin: req.user?.id,
        client: userID,
        type: 'deleteJobPosition',
        id: id,
      },
    );
    return this.jobPositionsService.remove(id, req.user?.id);
  }

  @Delete('bullet-point/:id')
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  removeBulletPoint(@Param('id') id: string) {
    return this.jobPositionsService.removeBulletPoint(id);
  }
}
