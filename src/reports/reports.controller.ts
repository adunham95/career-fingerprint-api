import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':orgID/top-employers')
  @UseGuards(JwtAuthGuard)
  getTopEmployers(@Param('orgID') orgID: string) {
    return this.reportsService.getTopEmployers(orgID);
  }

  @Get(':orgID/seat-utilization')
  @UseGuards(JwtAuthGuard)
  getSeatUtilization(@Param('orgID') orgID: string) {
    return this.reportsService.getSeatUtilization(orgID);
  }

  @Get(':orgID/active-vs-inactive')
  @UseGuards(JwtAuthGuard)
  getActiveVsInactive(@Param('orgID') orgID: string) {
    return this.reportsService.getActiveVsInactive(orgID);
  }
}
