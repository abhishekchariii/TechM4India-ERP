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

import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@UseGuards(
  AuthGuard('jwt'),
  PermissionsGuard,
)
@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
  ) {}

  @Post()
  @RequirePermissions('expenses.manage')
  create(
    @Body()
    createExpenseDto: CreateExpenseDto,
  ) {
    return this.expensesService.create(
      createExpenseDto,
    );
  }

  @Get()
  @RequirePermissions('expenses.read')
  findAll() {
    return this.expensesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('expenses.read')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('expenses.manage')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(
      id,
      updateExpenseDto,
    );
  }

  @Delete(':id')
  @RequirePermissions('expenses.manage')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.expensesService.remove(id);
  }
}