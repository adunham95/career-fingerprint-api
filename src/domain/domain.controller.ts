import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DomainService } from './domain.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { RequirePermission } from 'src/permission/permission.decorator';
import { PermissionGuard } from 'src/permission/permission.guard';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('domain')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Post()
  @RequirePermission('org:update_details')
  @UseGuards(BetterAuthGuard, PermissionGuard)
  create(@Body() createDomainDto: CreateDomainDto) {
    return this.domainService.create(createDomainDto);
  }

  @Get()
  findAll() {
    return this.domainService.findAll();
  }

  @Get('org/:orgID')
  findAllByOrg(@Param('orgID') id: string) {
    return this.domainService.findAllByOrg(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.domainService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('org:update_details')
  @UseGuards(BetterAuthGuard, PermissionGuard)
  update(@Param('id') id: string, @Body() updateDomainDto: UpdateDomainDto) {
    return this.domainService.update(id, updateDomainDto);
  }

  @Delete(':id')
  @RequirePermission('org:update_details')
  @UseGuards(BetterAuthGuard, PermissionGuard)
  remove(@Param('id') id: string) {
    return this.domainService.remove(id);
  }
}
