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

import { SalesOrdersService } from './sales-orders.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';

import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('sales-orders')
export class SalesOrdersController {
  constructor(
    private readonly salesOrdersService: SalesOrdersService,
  ) {}

  // CREATE SALES ORDER
  @RequirePermissions('sales_orders.manage')
  @Post()
  create(
    @Body() createSalesOrderDto: CreateSalesOrderDto,
  ) {
    return this.salesOrdersService.create(
      createSalesOrderDto,
    );
  }

  // GET ALL SALES ORDERS
  @RequirePermissions('sales_orders.read')
  @Get()
  findAll() {
    return this.salesOrdersService.findAll();
  }

  // GET ONE SALES ORDER
  @RequirePermissions('sales_orders.read')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesOrdersService.findOne(id);
  }

  // UPDATE SALES ORDER
  @RequirePermissions('sales_orders.manage')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSalesOrderDto: UpdateSalesOrderDto,
  ) {
    return this.salesOrdersService.update(
      id,
      updateSalesOrderDto,
    );
  }

  // COMPLETE SALES ORDER
  @RequirePermissions('sales_orders.manage')
  @Patch(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.salesOrdersService.complete(id);
  }

  // DELETE SALES ORDER
  @RequirePermissions('sales_orders.manage')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salesOrdersService.remove(id);
  }
}