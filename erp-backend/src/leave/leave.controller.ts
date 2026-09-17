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

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { LeaveService } from './leave.service';

@Controller('leave')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get()
  @RequirePermissions('leave.read')
  findAll() {
    return this.leaveService.findAll();
  }

  @Get(':id')
  @RequirePermissions('leave.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.leaveService.findOne(id);
  }

  @Post()
  @RequirePermissions('leave.manage')
  create(@Body() dto: CreateLeaveDto) {
    return this.leaveService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('leave.manage')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeaveDto,
  ) {
    return this.leaveService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('leave.manage')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.leaveService.remove(id);
  }
}