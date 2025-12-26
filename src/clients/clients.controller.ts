import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, InviteClientDto } from './dto/create-client.dto';
import { RequirePermission } from 'src/permission/permission.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionGuard } from 'src/permission/permission.guard';
import { OrgMemberGuard } from 'src/org/org-admin.guard';
import { Request } from 'express';

@Controller('client')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @RequirePermission('users:add')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Post('invite')
  @RequirePermission('client:add')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  invite(@Body() inviteClientDto: InviteClientDto, @Req() req: Request) {
    const orgID = req.user?.orgID;
    const userID = req.user?.id;
    if (!userID) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    console.log({ orgID });
    inviteClientDto.orgID = orgID || undefined;
    inviteClientDto.userID = userID;
    return this.clientsService.invite(inviteClientDto);
  }
}
