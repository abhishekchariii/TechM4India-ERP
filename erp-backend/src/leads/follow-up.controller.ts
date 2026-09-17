import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { FollowUpService } from './follow-up.service';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';

import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('leads')
export class FollowUpController {
  constructor(
    private readonly followUpService: FollowUpService,
  ) {}

  @RequirePermissions('leads.manage')
  @Post(':leadId/follow-ups')
  create(
    @Param('leadId', ParseIntPipe) leadId: number,
    @Body() dto: CreateFollowUpDto,
  ) {
    return this.followUpService.create(leadId, dto);
  }

  @RequirePermissions('leads.read')
  @Get(':leadId/follow-ups')
  findAll(
    @Param('leadId', ParseIntPipe) leadId: number,
  ) {
    return this.followUpService.findAll(leadId);
  }

  @RequirePermissions('leads.read')
  @Get('follow-ups/:id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.followUpService.findOne(id);
  }

  @RequirePermissions('leads.manage')
  @Patch('follow-ups/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFollowUpDto,
  ) {
    return this.followUpService.update(id, dto);
  }

  @RequirePermissions('leads.manage')
  @Delete('follow-ups/:id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.followUpService.remove(id);
  }
}