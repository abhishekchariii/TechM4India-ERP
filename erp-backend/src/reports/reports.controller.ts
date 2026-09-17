import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { ReportsService } from './reports.service';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
  ) {}

  // 💰 SALES REPORT
  @RequirePermissions('reports.read')
  @Get('sales')
  getSalesReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getSalesReport(
      startDate,
      endDate,
    );
  }

  // 🛒 PURCHASE REPORT
  @RequirePermissions('reports.read')
  @Get('purchases')
  getPurchaseReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getPurchaseReport(
      startDate,
      endDate,
    );
  }

  // 📦 INVENTORY REPORT
  @RequirePermissions('reports.read')
  @Get('inventory')
  getInventoryReport() {
    return this.reportsService.getInventoryReport();
  }

  // 👨‍💼 PAYROLL REPORT
  @RequirePermissions('reports.read')
  @Get('payroll')
  getPayrollReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getPayrollReport(
      startDate,
      endDate,
    );
  }
}