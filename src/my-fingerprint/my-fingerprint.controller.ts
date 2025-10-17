import { Controller, Get, Param } from '@nestjs/common';
import { MyFingerprintService } from './my-fingerprint.service';

@Controller('my-fingerprint')
export class MyFingerprintController {
  constructor(private readonly myFingerprintService: MyFingerprintService) {}

  @Get('user/:userID')
  getUsersFingerprint(@Param('userID') userID: string) {
    return this.myFingerprintService.byUser(+userID);
  }
}
