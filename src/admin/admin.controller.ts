import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PlatformAdminGuard } from 'src/auth/platform-admin.guard';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @UseGuards(BetterAuthGuard, PlatformAdminGuard)
  getAdminDashboard() {
    return this.adminService.getAdminDashboard();
  }
}
