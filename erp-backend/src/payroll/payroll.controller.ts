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

import { PayrollService } from './payroll.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';

import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@UseGuards(
  AuthGuard('jwt'),
  PermissionsGuard,
)
@Controller('payroll')
export class PayrollController {
  constructor(
    private readonly payrollService: PayrollService,
  ) {}

  @Get()
  @RequirePermissions('payroll.read')
  findAll() {
    return this.payrollService.findAll();
  }

  @Get(':id')
  @RequirePermissions('payroll.read')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.payrollService.findOne(id);
  }

  @Post()
  @RequirePermissions('payroll.manage')
  create(
    @Body()
    payroll: CreatePayrollDto,
  ) {
    return this.payrollService.create(
      payroll.employeeId,
      payroll.basicSalary,
      payroll.bonus ?? 0,
      payroll.deductions ?? 0,
      payroll.month,
    );
  }

  @Patch(':id')
  @RequirePermissions('payroll.manage')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    payroll: UpdatePayrollDto,
  ) {
    return this.payrollService.update(
      id,
      payroll.employeeId,
      payroll.basicSalary,
      payroll.bonus,
      payroll.deductions,
      payroll.month,
    );
  }

  @Delete(':id')
  @RequirePermissions('payroll.manage')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.payrollService.remove(id);
  }
}