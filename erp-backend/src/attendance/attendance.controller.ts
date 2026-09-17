import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  // GET all attendance - RBAC protected 🔐
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('attendance.read')
  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }

  // GET one attendance record - RBAC protected 🔐
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('attendance.read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(Number(id));
  }

  // CREATE attendance - RBAC protected 🔐
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('attendance.manage')
  @Post()
  create(@Body() attendance: CreateAttendanceDto) {
    return this.attendanceService.create(
      attendance.employeeId,
      attendance.date,
      attendance.checkIn,
      attendance.checkOut,
      attendance.status,
    );
  }
  

  // UPDATE attendance
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
 @RequirePermissions('attendance.manage')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() attendance: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(
      Number(id),
      attendance.employeeId,
      attendance.date,
      attendance.checkIn,
      attendance.checkOut,
      attendance.status,
    );
  }

  // DELETE attendance
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
 @RequirePermissions('attendance.manage')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(Number(id));
  }
}