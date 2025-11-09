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
// import { UpdateOrgDto } from './dto/update-org.dto';
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
// import { Request } from 'express';

@Controller('org')
export class OrgController {
  constructor(private readonly orgService: OrgService) {}

  @Post()
  create(@Body() createOrgDto: CreateOrgDto) {
    return this.orgService.create(createOrgDto);
  }

  @Get(':orgID/users')
  @RequirePermission('users:list')
  @UseGuards(JwtAuthGuard, PermissionGuard)
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
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Header('Cache-Control', 'private, max-age=30')
  getOrgAdmins(@Param('orgID') id: string) {
    return this.orgService.getOrgAdmins(id);
  }

  @Post(':orgID/admins')
  @RequirePermission('admins:manage')
  @UseGuards(JwtAuthGuard, PermissionGuard)
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
  @RequirePermission('users:remove')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  removeUserFromOrg(
    @Param('orgID') id: string,
    @Param('userID') userID: string,
  ) {
    return this.orgService.removeUserFromOrg(id, +userID);
  }

  @Delete(':orgID/admin/:userID')
  @RequirePermission('admins:manage')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  removeAdminFromOrg(
    @Param('orgID') id: string,
    @Param('userID') userID: string,
  ) {
    return this.orgService.removeAdminFromOrg(id, +userID);
  }

  @Patch(':orgID/admin/:userID')
  @RequirePermission('admins:manage')
  @UseGuards(JwtAuthGuard, PermissionGuard)
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
  @UseGuards(JwtAuthGuard, PermissionGuard)
  myOrgRoles(@Param('id') id: string) {
    return this.orgService.getRolesForOrg(id);
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
  @UseGuards(JwtAuthGuard, PermissionGuard)
  update(@Param('id') id: string, @Body() updateOrgDto: UpdateOrgDto) {
    return this.orgService.update(id, updateOrgDto);
  }

  @Patch(':id/add-subscription')
  @UseGuards(JwtAuthGuard, PlatformAdminGuard)
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

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.orgService.remove(+id);
  // }
}
