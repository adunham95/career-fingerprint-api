import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RequirePermission } from 'src/permission/permission.decorator';
import { PermissionGuard } from 'src/permission/permission.guard';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':orgID')
  @RequirePermission('reports:view')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  async getTopEmployers(@Param('orgID') orgID: string) {
    const topEmployers = await this.reportsService.getTopEmployers(orgID);
    const seatUtilization = await this.reportsService.getSeatUtilization(orgID);
    const activeVSInActive =
      await this.reportsService.getActiveVsInactive(orgID);
    return { topEmployers, seatUtilization, activeVSInActive };
  }

  @Get(':orgID/top-employers')
  @RequirePermission('reports:view')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  getReports(@Param('orgID') orgID: string) {
    return this.reportsService.getTopEmployers(orgID);
  }

  @Get(':orgID/seat-utilization')
  @RequirePermission('reports:view')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  getSeatUtilization(@Param('orgID') orgID: string) {
    return this.reportsService.getSeatUtilization(orgID);
  }

  @Get(':orgID/active-vs-inactive')
  @RequirePermission('reports:view')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  getActiveVsInactive(@Param('orgID') orgID: string) {
    return this.reportsService.getActiveVsInactive(orgID);
  }

  @Get(':orgID/weekly')
  @RequirePermission('reports:view')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  getWeekly(@Param('orgID') orgID: string) {
    return this.reportsService.getWeeklyReportCached(orgID);
  }
}
