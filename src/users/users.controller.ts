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
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User as UserModel } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
import { PlatformAdminGuard } from 'src/auth/platform-admin.guard';
import { OrgMemberGuard } from 'src/org/org-admin.guard';
import { PermissionGuard } from 'src/permission/permission.guard';
import { RequirePermission } from 'src/permission/permission.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('start-verify-email')
  @UseGuards(JwtAuthGuard)
  startVerifyEmail(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.usersService.startEmailVerification(req.user);
  }

  @Post()
  signupUser(
    @Body()
    userData: CreateUserDto,
  ): Promise<UserModel> {
    return this.usersService.createUser(userData);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PlatformAdminGuard)
  findAll() {
    return this.usersService.users({ orderBy: { createdAt: 'desc' } });
  }

  @Get('new-invite-code')
  @UseGuards(JwtAuthGuard)
  generateNewInviteCode(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.usersService.newInviteCode(req.user.id);
  }

  @Get('invite-stats')
  @UseGuards(JwtAuthGuard)
  getInviteCodeStats(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.usersService.inviteCodeStats(req.user.id);
  }

  @Get('me/billing-status')
  @UseGuards(JwtAuthGuard)
  getMyStripeStatus(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.usersService.getStripeStatus(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.user({ id: +id });
  }
  @Get('client/:id')
  @RequirePermission('client:view')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  findClient(@Param('id') id: string) {
    return this.usersService.user({ id: +id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser({
      where: { id: +id },
      data: updateUserDto,
    });
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  remove(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.usersService.deleteUser(req.user.id);
  }
}
