import {
  Controller,
  // Get,
  Post,
  Body,
  Get,
  Param,
  Query,
  Delete,
  UseGuards,
  Patch,
  Header,
  Req,
  HttpException,
  HttpStatus,
  // Patch,
  // Param,
  // Delete,
  // UseGuards,
} from '@nestjs/common';
import { OrgService } from './org.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateOrgDto, UpdateOrgSubscriptionDto } from './dto/update-org.dto';
import { PlatformAdminGuard } from 'src/auth/platform-admin.guard';
import { Request } from 'express';
import { RequirePermission } from 'src/permission/permission.decorator';
import { PermissionGuard } from 'src/permission/permission.guard';
import { OrgMemberGuard } from './org-admin.guard';
import { Cron, CronExpression } from '@nestjs/schedule';
// import { UpdateOrgDto } from './dto/update-org.dto';
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
// import { Request } from 'express';

@Controller('org')
export class OrgController {
  constructor(private readonly orgService: OrgService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createOrgDto: CreateOrgDto) {
    return this.orgService.create(createOrgDto);
  }

  @Get(':orgID/users')
  @RequirePermission('client:list')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  @Header('Cache-Control', 'private, max-age=30')
  getOrgUser(
    @Param('orgID') id: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.orgService.getOrgUsers(id, Number(pageSize), Number(page));
  }

  @Get(':orgID/admins')
  @RequirePermission('admins:view')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  @Header('Cache-Control', 'private, max-age=30')
  getOrgAdmins(@Param('orgID') id: string) {
    return this.orgService.getOrgAdmins(id);
  }

  @Post(':orgID/admins')
  @RequirePermission('admins:manage')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  newOrgAdmin(
    @Param('orgID') id: string,
    @Body()
    createOrgDto: {
      firstName?: string;
      lastName?: string;
      email: string;
      roles: string[];
    },
  ) {
    return this.orgService.addOrgAdmin(
      id,
      createOrgDto.email,
      createOrgDto.roles,
      createOrgDto.firstName,
      createOrgDto.lastName,
    );
  }

  @Delete(':orgID/user/:userID')
  @RequirePermission('client:remove')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  removeUserFromOrg(
    @Param('orgID') id: string,
    @Param('userID') userID: string,
  ) {
    return this.orgService.removeUserFromOrg(id, +userID);
  }

  @Delete(':orgID/admin/:userID')
  @RequirePermission('admins:manage')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  removeAdminFromOrg(
    @Param('orgID') id: string,
    @Param('userID') userID: string,
  ) {
    return this.orgService.removeAdminFromOrg(id, +userID);
  }

  @Patch(':orgID/admin/:userID')
  @RequirePermission('admins:manage')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  updateAdminFromOrg(
    @Param('orgID') id: string,
    @Param('userID') userID: string,
    @Body()
    updateOrgAdminDetailsDTO: {
      roles: string[];
    },
  ) {
    return this.orgService.updateAdminOrgDetails(
      id,
      +userID,
      updateOrgAdminDetailsDTO,
    );
  }

  @Get(':id/permissions')
  @UseGuards(JwtAuthGuard)
  myOrgPermissions(@Param('id') id: string, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.orgService.getMyPermissionForOrg(id, req.user.id);
  }

  @Get(':id/roles')
  @RequirePermission('admins:manage')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  myOrgRoles(@Param('id') id: string) {
    return this.orgService.getRolesForOrg(id);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMine(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.orgService.findMine(req.user.id);
  }

  @Get(':id')
  @Header('Cache-Control', 'private, max-age=30')
  findOne(
    @Param('id') id: string,
    @Query() query: { includeSubscription?: string },
  ) {
    return this.orgService.findOne(id, query?.includeSubscription);
  }

  @Get(':id/details')
  @UseGuards(JwtAuthGuard, PlatformAdminGuard)
  @Header('Cache-Control', 'private, max-age=30')
  findOneDetails(
    @Param('id') id: string,
    @Query() query: { includeSubscription?: string },
  ) {
    return this.orgService.findOne(id, query?.includeSubscription);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PlatformAdminGuard)
  findAll() {
    return this.orgService.findAll();
  }

  @Patch(':id')
  @RequirePermission('org:update_details')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  update(@Param('id') id: string, @Body() updateOrgDto: UpdateOrgDto) {
    return this.orgService.update(id, updateOrgDto);
  }

  @Patch(':id/add-subscription')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PlatformAdminGuard)
  updatePlatformAdmin(
    @Param('id') id: string,
    @Body() updateOrgDto: UpdateOrgSubscriptionDto,
  ) {
    return this.orgService.updateSubscription(id, updateOrgDto);
  }

  @Post(':id/sso-metadata')
  // @UseGuards(JwtAuthGuard)
  ssoMetaData(
    @Param('id') id: string,
    @Body() setSSOMetadata: { xml: string },
  ) {
    return this.orgService.xmlToSSOData(id, setSSOMetadata.xml);
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async runDailyReferralCredits() {
    // this.logger.log('Running daily referral credit job...');
    await this.orgService.updateOrgQuantity();
  }
}
