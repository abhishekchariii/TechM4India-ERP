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

import { PurchaseOrdersService } from './purchase-orders.service';

import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';

import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@UseGuards(
  AuthGuard('jwt'),
  PermissionsGuard,
)
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(
    private readonly purchaseOrdersService: PurchaseOrdersService,
  ) {}

  @RequirePermissions(
    'purchase_orders.manage',
  )
  @Post()
  create(
    @Body()
    createPurchaseOrderDto: CreatePurchaseOrderDto,
  ) {
    return this.purchaseOrdersService.create(
      createPurchaseOrderDto,
    );
  }

  @RequirePermissions(
    'purchase_orders.read',
  )
  @Get()
  findAll() {
    return this.purchaseOrdersService.findAll();
  }

  @RequirePermissions(
    'purchase_orders.read',
  )
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.purchaseOrdersService.findOne(
      id,
    );
  }

  @RequirePermissions(
    'purchase_orders.manage',
  )
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updatePurchaseOrderDto: UpdatePurchaseOrderDto,
  ) {
    return this.purchaseOrdersService.update(
      id,
      updatePurchaseOrderDto,
    );
  }

  @RequirePermissions(
    'purchase_orders.manage',
  )
  @Patch(':id/receive')
  receive(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.purchaseOrdersService.receive(
      id,
    );
  }

  @RequirePermissions(
    'purchase_orders.manage',
  )
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.purchaseOrdersService.remove(
      id,
    );
  }
}