import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PlatformAdminGuard } from 'src/auth/platform-admin.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, PlatformAdminGuard)
  getAdminDashboard() {
    return this.adminService.getAdminDashboard();
  }
}
