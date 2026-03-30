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
import { RequirePermission } from 'src/permission/permission.decorator';
import { OrgMemberGuard } from 'src/org/org-admin.guard';
import { PermissionGuard } from 'src/permission/permission.guard';
import { AuditService } from 'src/audit/audit.service';
import { AUDIT_EVENT } from 'src/audit/auditEvents';
import { HasFeature } from 'src/decorators/has-feature.decorator';
import { FeatureGuard } from 'src/auth/feature.guard';
import { FeatureFlags } from 'src/utils/featureFlags';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('education')
export class EducationController {
  constructor(
    private readonly educationService: EducationService,
    private auditService: AuditService,
  ) {}

  @Post()
  @HasFeature(FeatureFlags.EducationCreate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  create(@Body() createEducationDto: CreateEducationDto, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    createEducationDto.userID = req.user.id;
    return this.educationService.create(createEducationDto);
  }

  @Post('client/:userID')
  @RequirePermission('career:edit')
  @UseGuards(BetterAuthGuard, OrgMemberGuard, PermissionGuard)
  async createClient(
    @Body() createEducationDto: CreateEducationDto,
    @Req() req: Request,
    @Param('userID') userID: string,
  ) {
    await this.auditService.logEvent(
      AUDIT_EVENT.ADMIN_EDITED_DATA,
      undefined,
      undefined,
      { admin: req.user?.id, client: userID, type: 'addedEducation' },
    );
    createEducationDto.userID = +userID;
    return this.educationService.create(createEducationDto);
  }

  @Get()
  findAll() {
    return this.educationService.findAll();
  }

  @Get('my')
  @Header('Cache-Control', 'private, max-age=30')
  @HasFeature(FeatureFlags.EducationRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findMyEducation(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    return this.educationService.findMyEducation(req.user.id);
  }

  @Get(':id')
  @HasFeature(FeatureFlags.EducationRead)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  @Header('Cache-Control', 'private, max-age=30')
  findOne(@Param('id') id: string) {
    return this.educationService.findOne(id);
  }

  @Patch(':id')
  @HasFeature(FeatureFlags.EducationUpdate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  update(
    @Param('id') id: string,
    @Body() updateEducationDto: UpdateEducationDto,
  ) {
    return this.educationService.update(id, updateEducationDto);
  }

  @Patch(':id/client/:userID')
  @RequirePermission('career:edit')
  @UseGuards(BetterAuthGuard, OrgMemberGuard, PermissionGuard)
  async updateClient(
    @Param('id') id: string,
    @Body() updateEducationDto: UpdateEducationDto,
    @Req() req: Request,
    @Param('userID') userID: string,
  ) {
    await this.auditService.logEvent(
      AUDIT_EVENT.ADMIN_EDITED_DATA,
      undefined,
      undefined,
      { admin: req.user?.id, client: userID, type: 'updatedEducation' },
    );
    return this.educationService.update(id, updateEducationDto);
  }

  @Delete(':id')
  @HasFeature(FeatureFlags.EducationDelete)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.educationService.remove(id, req.user?.id);
  }

  @Delete(':id/client/:userID')
  @RequirePermission('career:edit')
  @UseGuards(BetterAuthGuard, OrgMemberGuard, PermissionGuard)
  async removeClientObject(
    @Param('id') id: string,
    @Req() req: Request,
    @Param('userID') userID: string,
  ) {
    await this.auditService.logEvent(
      AUDIT_EVENT.ADMIN_EDITED_DATA,
      undefined,
      undefined,
      { admin: req.user?.id, client: userID, type: 'updatedEducation' },
    );
    return this.educationService.remove(id, req.user?.id);
  }
}
