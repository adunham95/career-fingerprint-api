import {
  Controller,
  // Get,
  Post,
  Body,
  Get,
  Param,
  Query,
  Delete,
  // Patch,
  // Param,
  // Delete,
  // UseGuards,
} from '@nestjs/common';
import { OrgService } from './org.service';
import { CreateOrgDto } from './dto/create-org.dto';
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
  getOrgUser(
    @Param('orgID') id: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.orgService.getOrgUsers(id, Number(pageSize), Number(page));
  }

  @Get(':orgID/admins')
  getOrgAdmins(@Param('orgID') id: string) {
    return this.orgService.getOrgAdmins(id);
  }

  @Delete(':orgID/user/:userID')
  removeUserFromOrg(
    @Param('orgID') id: string,
    @Param('userID') userID: string,
  ) {
    return this.orgService.removeUserFromOrg(id, +userID);
  }

  @Delete(':orgID/admin/:userID')
  removeAdminFromOrg(
    @Param('orgID') id: string,
    @Param('userID') userID: string,
  ) {
    return this.orgService.removeAdminFromOrg(id, +userID);
  }

  // @Get()
  // findAll() {
  //   return this.orgService.findAll();
  // }

  // @Get(':id')
  // @UseGuards(JwtAuthGuard)
  // findOne(@Param('id') id: string) {
  //   return this.orgService.findOne(id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrgDto: UpdateOrgDto) {
  //   return this.orgService.update(+id, updateOrgDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.orgService.remove(+id);
  // }
}
