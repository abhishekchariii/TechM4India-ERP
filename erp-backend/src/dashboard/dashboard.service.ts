import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalEmployees,
      totalInventoryItems,
      lowStockItems,
      totalPurchaseOrders,
      totalSalesOrders,
      totalInvoices,
      pendingInvoices,
      partiallyPaidInvoices,
      paidInvoices,
      totalRevenue,
      totalPurchaseAmount,
    ] = await Promise.all([
      this.prisma.employee.count(),

      this.prisma.inventory.count(),

      this.prisma.inventory.count({
        where: {
          quantity: {
            lte: 5,
          },
        },
      }),

      this.prisma.purchaseOrder.count(),

      this.prisma.salesOrder.count(),

      this.prisma.invoice.count(),

      this.prisma.invoice.count({
        where: {
          status: 'PENDING',
        },
      }),

      this.prisma.invoice.count({
        where: {
          status: 'PARTIALLY_PAID',
        },
      }),

      this.prisma.invoice.count({
        where: {
          status: 'PAID',
        },
      }),

      this.prisma.salesOrder.aggregate({
        where: {
          status: 'COMPLETED',
        },
        _sum: {
          totalAmount: true,
        },
      }),

      this.prisma.purchaseOrder.aggregate({
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    return {
      employees: {
        total: totalEmployees,
      },

      inventory: {
        totalItems: totalInventoryItems,
        lowStockItems,
      },

      purchaseOrders: {
        total: totalPurchaseOrders,
        totalAmount:
          totalPurchaseAmount._sum.totalAmount ?? 0,
      },

      sales: {
        totalOrders: totalSalesOrders,
        totalRevenue:
          totalRevenue._sum.totalAmount ?? 0,
      },

      invoices: {
        total: totalInvoices,
        pending: pendingInvoices,
        partiallyPaid: partiallyPaidInvoices,
        paid: paidInvoices,
      },
    };
  }
}