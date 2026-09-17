import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------
  // DATE FILTER HELPER
  // ---------------------------------------------------------
  private buildDateFilter(
    startDate?: string,
    endDate?: string,
  ) {
    const filter: any = {};

    if (startDate) {
      const start = new Date(`${startDate}T00:00:00.000`);

      if (Number.isNaN(start.getTime())) {
        throw new BadRequestException('Invalid start date');
      }

      filter.gte = start;
    }

    if (endDate) {
      // Include the COMPLETE selected end date
      const end = new Date(`${endDate}T23:59:59.999`);

      if (Number.isNaN(end.getTime())) {
        throw new BadRequestException('Invalid end date');
      }

      filter.lte = end;
    }

    return filter;
  }

  // ---------------------------------------------------------
  // 💰 SALES REPORT
  // ---------------------------------------------------------
  async getSalesReport(
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = {
      status: 'COMPLETED',
    };

    if (startDate || endDate) {
      where.orderDate = this.buildDateFilter(
        startDate,
        endDate,
      );
    }

    const [orders, summary] = await Promise.all([
      this.prisma.salesOrder.findMany({
        where,
        include: {
          customer: true,
          items: {
            include: {
              inventory: true,
            },
          },
        },
        orderBy: {
          orderDate: 'desc',
        },
      }),

      this.prisma.salesOrder.aggregate({
        where,
        _sum: {
          totalAmount: true,
        },
        _count: true,
      }),
    ]);

    return {
      totalOrders: summary._count,
      totalRevenue: summary._sum.totalAmount ?? 0,
      orders,
    };
  }

  // ---------------------------------------------------------
  // 🛒 PURCHASE REPORT
  // ---------------------------------------------------------
  async getPurchaseReport(
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = {};

    if (startDate || endDate) {
      where.orderDate = this.buildDateFilter(
        startDate,
        endDate,
      );
    }

    const [orders, summary] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: true,
          items: {
            include: {
              inventory: true,
            },
          },
        },
        orderBy: {
          orderDate: 'desc',
        },
      }),

      this.prisma.purchaseOrder.aggregate({
        where,
        _sum: {
          totalAmount: true,
        },
        _count: true,
      }),
    ]);

    return {
      totalOrders: summary._count,
      totalPurchaseAmount:
        summary._sum.totalAmount ?? 0,
      orders,
    };
  }

  // ---------------------------------------------------------
  // 📦 INVENTORY REPORT
  // ---------------------------------------------------------
  async getInventoryReport() {
    const inventory =
      await this.prisma.inventory.findMany({
        orderBy: {
          quantity: 'asc',
        },
      });

    const lowStockItems = inventory.filter(
      (item) => item.quantity <= 5,
    );

    const totalStockValue = inventory.reduce(
      (total, item) =>
        total + item.quantity * item.price,
      0,
    );

    return {
      totalItems: inventory.length,
      lowStockCount: lowStockItems.length,
      totalStockValue,
      lowStockItems,
      inventory,
    };
  }

  // ---------------------------------------------------------
  // 👨‍💼 PAYROLL REPORT
  // ---------------------------------------------------------
  async getPayrollReport(
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = this.buildDateFilter(
        startDate,
        endDate,
      );
    }

    const [payrolls, summary] =
      await Promise.all([
        this.prisma.payroll.findMany({
          where,
          include: {
            employee: {
              include: {
                department: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),

        this.prisma.payroll.aggregate({
          where,
          _sum: {
            basicSalary: true,
            bonus: true,
            deductions: true,
            netSalary: true,
          },
          _count: true,
        }),
      ]);

    return {
      totalPayrollRecords: summary._count,
      totalBasicSalary:
        summary._sum.basicSalary ?? 0,
      totalBonus:
        summary._sum.bonus ?? 0,
      totalDeductions:
        summary._sum.deductions ?? 0,
      totalNetSalary:
        summary._sum.netSalary ?? 0,
      payrolls,
    };
  }
}