import { JwtAuthGuard } from './../auth/jwt-auth.guard';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MyFingerprintService } from './my-fingerprint.service';
import { OrgMemberGuard } from 'src/org/org-admin.guard';
import { PermissionGuard } from 'src/permission/permission.guard';
import { RequirePermission } from 'src/permission/permission.decorator';

@Controller('my-fingerprint')
export class MyFingerprintController {
  constructor(private readonly myFingerprintService: MyFingerprintService) {}

  @Get('client/:userID')
  @RequirePermission('career:view')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  getUsersFingerprint(@Param('userID') userID: string) {
    console.log('Fetching my fingerprint');
    return this.myFingerprintService.byUser(+userID);
  }
}
