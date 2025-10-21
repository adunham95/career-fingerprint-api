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
  // Patch,
  // Param,
  // Delete,
  // UseGuards,
} from '@nestjs/common';
import { OrgService } from './org.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateOrgDto } from './dto/update-org.dto';
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
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'private, max-age=30')
  getOrgUser(
    @Param('orgID') id: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.orgService.getOrgUsers(id, Number(pageSize), Number(page));
  }

  @Get(':orgID/admins')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'private, max-age=30')
  getOrgAdmins(@Param('orgID') id: string) {
    return this.orgService.getOrgAdmins(id);
  }

  @Post(':orgID/admins')
  @UseGuards(JwtAuthGuard)
  newOrgAdmin(
    @Param('orgID') id: string,
    @Body()
    createOrgDto: {
      firstName?: string;
      lastName?: string;
      email: string;
    },
  ) {
    return this.orgService.addOrgAdmin(
      id,
      createOrgDto.email,
      createOrgDto.firstName,
      createOrgDto.lastName,
    );
  }

  @Delete(':orgID/user/:userID')
  @UseGuards(JwtAuthGuard)
  removeUserFromOrg(
    @Param('orgID') id: string,
    @Param('userID') userID: string,
  ) {
    return this.orgService.removeUserFromOrg(id, +userID);
  }

  @Delete(':orgID/admin/:userID')
  @UseGuards(JwtAuthGuard)
  removeAdminFromOrg(
    @Param('orgID') id: string,
    @Param('userID') userID: string,
  ) {
    return this.orgService.removeAdminFromOrg(id, +userID);
  }

  @Get(':id')
  @Header('Cache-Control', 'private, max-age=30')
  findOne(
    @Param('id') id: string,
    @Query() query: { includeSubscription?: string },
  ) {
    return this.orgService.findOne(id, query?.includeSubscription);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateOrgDto: UpdateOrgDto) {
    return this.orgService.update(id, updateOrgDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.orgService.remove(+id);
  // }
}
