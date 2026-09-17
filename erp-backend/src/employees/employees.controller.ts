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

import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';

import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('employees')
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  // GET all employees - RBAC protected 🔐
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('employees.read')
  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  // GET one employee - RBAC protected 🔐
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('employees.read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(Number(id));
  }

  // CREATE employee - RBAC protected 🔐
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('employees.manage')
  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(
      createEmployeeDto.name,
      createEmployeeDto.email,
      createEmployeeDto.phone,
      createEmployeeDto.position,
      createEmployeeDto.departmentId,
    );
  }

  // UPDATE employee
 @UseGuards(AuthGuard('jwt'), PermissionsGuard)
 @RequirePermissions('employees.manage')
 @Patch(':id')
 update(
    @Param('id') id: string,
    @Body() employee: CreateEmployeeDto,
  ) {
    return this.employeesService.update(
      Number(id),
      employee.name,
      employee.email,
      employee.phone,
      employee.position,
      employee.departmentId,
    );
  }

  // DELETE employee
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
 @RequirePermissions('employees.manage')
 @Delete(':id')
 remove(@Param('id') id: string) {
    return this.employeesService.remove(Number(id));
  }
}