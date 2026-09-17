import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';

import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =========================================================
  // CREATE INVOICE
  // =========================================================

  async create(
    createInvoiceDto: CreateInvoiceDto,
  ) {
    const {
      salesOrderId,
      dueDate,
    } = createInvoiceDto;

    // Check Sales Order
    const salesOrder =
      await this.prisma.salesOrder.findUnique({
        where: {
          id: salesOrderId,
        },
      });

    if (!salesOrder) {
      throw new NotFoundException(
        `Sales Order with ID ${salesOrderId} not found`,
      );
    }

    // Invoice only for completed orders
    if (
      salesOrder.status !==
      'COMPLETED'
    ) {
      throw new BadRequestException(
        'Invoice can only be created for a completed Sales Order',
      );
    }

    // Prevent duplicate invoice
    const existingInvoice =
      await this.prisma.invoice.findUnique({
        where: {
          salesOrderId,
        },
      });

    if (existingInvoice) {
      throw new ConflictException(
        'An invoice already exists for this Sales Order',
      );
    }

    // Validate due date
    if (dueDate) {
      const due = new Date(
        dueDate,
      );

      if (
        Number.isNaN(
          due.getTime(),
        )
      ) {
        throw new BadRequestException(
          'Invalid due date',
        );
      }
    }

    return this.prisma.invoice.create({
      data: {
        salesOrderId,

        dueDate: dueDate
          ? new Date(dueDate)
          : undefined,

        totalAmount:
          salesOrder.totalAmount,

        paidAmount: 0,

        status: 'UNPAID',
      },

      include: {
        salesOrder: {
          include: {
            customer: true,

            items: {
              include: {
                inventory: true,
              },
            },
          },
        },

        payments: true,
      },
    });
  }

  // =========================================================
  // GET ALL INVOICES
  // =========================================================

  async findAll() {
    return this.prisma.invoice.findMany({
      include: {
        salesOrder: {
          include: {
            customer: true,
          },
        },

        payments: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // =========================================================
  // GET ONE INVOICE
  // =========================================================

  async findOne(id: number) {
    const invoice =
      await this.prisma.invoice.findUnique({
        where: {
          id,
        },

        include: {
          salesOrder: {
            include: {
              customer: true,

              items: {
                include: {
                  inventory: true,
                },
              },
            },
          },

          payments: true,
        },
      });

    if (!invoice) {
      throw new NotFoundException(
        `Invoice with ID ${id} not found`,
      );
    }

    return invoice;
  }

  // =========================================================
  // UPDATE INVOICE
  // =========================================================

  async update(
    id: number,
    updateInvoiceDto: UpdateInvoiceDto,
  ) {
    const invoice =
      await this.findOne(id);

    // Paid invoices should not be modified
    // except through payment workflow.
    if (
      invoice.status === 'PAID'
    ) {
      throw new BadRequestException(
        'A fully paid invoice cannot be updated',
      );
    }

    let dueDate:
      | Date
      | undefined;

    if (
      updateInvoiceDto.dueDate !==
      undefined
    ) {
      dueDate = new Date(
        updateInvoiceDto.dueDate,
      );

      if (
        Number.isNaN(
          dueDate.getTime(),
        )
      ) {
        throw new BadRequestException(
          'Invalid due date',
        );
      }
    }

    return this.prisma.invoice.update({
      where: {
        id,
      },

      data: {
        ...(dueDate !== undefined && {
          dueDate,
        }),
      },

      include: {
        salesOrder: {
          include: {
            customer: true,
          },
        },

        payments: true,
      },
    });
  }

  // =========================================================
  // ADD PAYMENT
  // =========================================================

  async addPayment(
    invoiceId: number,
    createPaymentDto: CreatePaymentDto,
  ) {
    const amount =
      Number(
        createPaymentDto.amount,
      );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new BadRequestException(
        'Payment amount must be greater than 0',
      );
    }

    const paymentMethod =
      createPaymentDto.paymentMethod?.trim();

    if (!paymentMethod) {
      throw new BadRequestException(
        'Payment method is required',
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        // Get invoice inside transaction
        const invoice =
          await tx.invoice.findUnique({
            where: {
              id: invoiceId,
            },
          });

        if (!invoice) {
          throw new NotFoundException(
            `Invoice with ID ${invoiceId} not found`,
          );
        }

        if (
          invoice.status ===
          'PAID'
        ) {
          throw new BadRequestException(
            'This invoice has already been fully paid',
          );
        }

        const totalAmount =
          Number(
            invoice.totalAmount,
          );

        const paidAmount =
          Number(
            invoice.paidAmount,
          );

        const remainingAmount =
          totalAmount -
          paidAmount;

        if (
          remainingAmount <= 0
        ) {
          throw new BadRequestException(
            'This invoice has no outstanding balance',
          );
        }

        // Prevent overpayment
        if (
          amount >
          remainingAmount
        ) {
          throw new BadRequestException(
            `Payment exceeds remaining amount. Remaining: ${remainingAmount}`,
          );
        }

        const newPaidAmount =
          paidAmount + amount;

        const isFullyPaid =
          newPaidAmount >=
          totalAmount;

        const status =
          isFullyPaid
            ? 'PAID'
            : 'PARTIALLY_PAID';

        // Create payment
        await tx.payment.create({
          data: {
            invoiceId,

            amount,

            paymentMethod,
          },
        });

        // Update invoice
        return tx.invoice.update({
          where: {
            id: invoiceId,
          },

          data: {
            paidAmount:
              newPaidAmount,

            status,
          },

          include: {
            salesOrder: {
              include: {
                customer: true,
              },
            },

            payments: true,
          },
        });
      },
    );
  }

  // =========================================================
  // DELETE INVOICE
  // =========================================================

  async remove(id: number) {
    const invoice =
      await this.findOne(id);

    // Protect paid invoices
    if (
      invoice.status === 'PAID'
    ) {
      throw new BadRequestException(
        'A fully paid invoice cannot be deleted',
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        // Delete payments
        await tx.payment.deleteMany({
          where: {
            invoiceId: id,
          },
        });

        // Delete invoice
        return tx.invoice.delete({
          where: {
            id,
          },
        });
      },
    );
  }
}