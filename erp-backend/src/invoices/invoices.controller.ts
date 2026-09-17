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

import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

import { InvoicesService } from './invoices.service';

import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@UseGuards(
  AuthGuard('jwt'),
  PermissionsGuard,
)
@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
  ) {}

  // =========================================================
  // CREATE INVOICE
  // =========================================================

  @Post()
  @RequirePermissions(
    'invoices.manage',
  )
  create(
    @Body()
    createInvoiceDto: CreateInvoiceDto,
  ) {
    return this.invoicesService.create(
      createInvoiceDto,
    );
  }

  // =========================================================
  // GET ALL
  // =========================================================

  @Get()
  @RequirePermissions(
    'invoices.read',
  )
  findAll() {
    return this.invoicesService.findAll();
  }

  // =========================================================
  // GET ONE
  // =========================================================

  @Get(':id')
  @RequirePermissions(
    'invoices.read',
  )
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.invoicesService.findOne(
      id,
    );
  }

  // =========================================================
  // UPDATE
  // =========================================================

  @Patch(':id')
  @RequirePermissions(
    'invoices.manage',
  )
  update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(
      id,
      updateInvoiceDto,
    );
  }

  // =========================================================
  // ADD PAYMENT
  // =========================================================

  @Post(':id/payments')
  @RequirePermissions(
    'payments.manage',
  )
  addPayment(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    createPaymentDto: CreatePaymentDto,
  ) {
    return this.invoicesService.addPayment(
      id,
      createPaymentDto,
    );
  }

  // =========================================================
  // DELETE
  // =========================================================

  @Delete(':id')
  @RequirePermissions(
    'invoices.manage',
  )
  remove(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.invoicesService.remove(
      id,
    );
  }
}