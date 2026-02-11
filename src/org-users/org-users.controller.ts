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
} from '@nestjs/common';
import { OrgUsersService } from './org-users.service';
import { UpdateOrgUserDto } from './dto/update-org-user.dto';
import { RequirePermission } from 'src/permission/permission.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OrgMemberGuard } from 'src/org/org-admin.guard';
import { PermissionGuard } from 'src/permission/permission.guard';
import { Request } from 'express';
import {
  CreateOrgAdminDto,
  CreateOrgUserDto,
  InviteClientDto,
} from './dto/create-org-user.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('org-users')
export class OrgUsersController {
  constructor(private readonly orgUsersService: OrgUsersService) {}

  @Post('member')
  @RequirePermission('users:create')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  newOrgMember(
    @Body() createOrgUserDto: CreateOrgUserDto,
    @Req() req: Request,
  ) {
    const orgID = req.user?.orgID;
    if (!orgID) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    createOrgUserDto.orgID = orgID;
    return this.orgUsersService.createOrgMember(createOrgUserDto);
  }

  @Post('client')
  @RequirePermission('client:add')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  inviteOrgClient(
    @Body() inviteClientDto: InviteClientDto,
    @Req() req: Request,
  ) {
    const orgID = req.user?.orgID;
    const userID = req.user?.id;
    if (!userID) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    console.log({ orgID });
    if (!orgID) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    inviteClientDto.orgID = orgID;
    return this.orgUsersService.createOrgClientInvite(inviteClientDto, userID);
  }

  @Post('admin')
  @RequirePermission('admins:manage')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  newOrgAdmin(
    @Body() createOrgAdminDto: CreateOrgAdminDto,
    @Req() req: Request,
  ) {
    const orgID = req.user?.orgID;
    if (!orgID) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    createOrgAdminDto.orgID = orgID;
    return this.orgUsersService.createOrgAdmin(createOrgAdminDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Get('join/:joinCode')
  verifyJoinCode(@Param('joinCode') joinCode: string, @Req() req: Request) {
    const userID = req.user?.id;
    return this.orgUsersService.verifyJoinCode(joinCode, userID);
  }

  @Post('join/:joinCode')
  @UseGuards(JwtAuthGuard)
  joinOrg(@Param('joinCode') joinCode: string, @Req() req: Request) {
    const userID = req.user?.id;
    if (!userID) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.orgUsersService.joinOrgWithCode(joinCode, userID);
  }

  // @Post('join')
  // @UseGuards(JwtAuthGuard)
  // createJoinCode(@Req() req: Request) {
  //   const userID = req.user?.id;
  //   if (!userID) {
  //     throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
  //   }
  //   return this.orgUsersService.joinOrgWithCode(joinCode, userID);
  // }

  @Get('connections')
  @UseGuards(JwtAuthGuard)
  findMyConnections(@Req() req: Request) {
    const userID = req.user?.id;
    if (!userID) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.orgUsersService.findMyConnections(userID);
  }

  @Get()
  findAll() {
    return this.orgUsersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orgUsersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, OrgMemberGuard)
  update(
    @Param('id') id: string,
    @Body() updateOrgUserDto: UpdateOrgUserDto,
    @Req() req: Request,
  ) {
    console.log(req.user);
    const orgID = req.user?.orgID;
    if (!orgID) {
      console.log('Missing Org ID');
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    updateOrgUserDto.orgID = orgID;

    return this.orgUsersService.update(id, updateOrgUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  removeFromOrg(@Param('id') id: string) {
    return this.orgUsersService.removeFromOrg(id);
  }
}
