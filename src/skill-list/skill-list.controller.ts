import {
  Body,
  Controller,
  Get,
  Header,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SkillListService } from './skill-list.service';

@Controller('skill-list')
export class SkillListController {
  constructor(private readonly skillListService: SkillListService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  upsertSkillList(
    @Body() skillListDto: { skillList: string[] },
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.skillListService.upsertSkillList(
      req.user.id,
      skillListDto.skillList,
    );
  }

  @Get('/my')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'private, max-age=30')
  mySkillList(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.skillListService.mySkillList(req.user.id);
  }
}
