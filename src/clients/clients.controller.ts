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
import { PermissionGuard } from 'src/permission/permission.guard';
import { OrgMemberGuard } from 'src/org/org-admin.guard';
import { Request } from 'express';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('client')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  /** @deprecated switch to use org users */
  @Post()
  @RequirePermission('users:add')
  @UseGuards(BetterAuthGuard, PermissionGuard)
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  /** @deprecated switch to use org users */
  @Post('invite')
  @RequirePermission('client:add')
  @UseGuards(BetterAuthGuard, OrgMemberGuard, PermissionGuard)
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
