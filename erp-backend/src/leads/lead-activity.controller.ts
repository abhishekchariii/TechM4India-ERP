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

import { LeadActivityService } from './lead-activity.service';
import { CreateLeadActivityDto } from './dto/create-lead-activity.dto';
import { UpdateLeadActivityDto } from './dto/update-lead-activity.dto';

import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('leads')
export class LeadActivityController {
  constructor(
    private readonly activityService: LeadActivityService,
  ) {}

  @RequirePermissions('leads.manage')
  @Post(':leadId/activities')
  create(
    @Param('leadId', ParseIntPipe) leadId: number,
    @Body() dto: CreateLeadActivityDto,
  ) {
    return this.activityService.create(leadId, dto);
  }

  @RequirePermissions('leads.read')
  @Get(':leadId/activities')
  findAll(
    @Param('leadId', ParseIntPipe) leadId: number,
  ) {
    return this.activityService.findAll(leadId);
  }

  @RequirePermissions('leads.read')
  @Get('activities/:id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.activityService.findOne(id);
  }

  @RequirePermissions('leads.manage')
  @Patch('activities/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeadActivityDto,
  ) {
    return this.activityService.update(id, dto);
  }

  @RequirePermissions('leads.manage')
  @Delete('activities/:id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.activityService.remove(id);
  }
}