import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';

import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';

@Injectable()
export class SalesOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================
  // CREATE SALES ORDER
  // =========================================================

  async create(createSalesOrderDto: CreateSalesOrderDto) {
    const { customerId, items } = createSalesOrderDto;

    if (!items || items.length === 0) {
      throw new BadRequestException(
        'At least one sales order item is required',
      );
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(
        `Customer with ID ${customerId} not found`,
      );
    }

    // Validate inventory items
    for (const item of items) {
      const inventoryItem = await this.prisma.inventory.findUnique({
        where: { id: item.inventoryId },
      });

      if (!inventoryItem) {
        throw new NotFoundException(
          `Inventory item with ID ${item.inventoryId} not found`,
        );
      }

      if (inventoryItem.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.quantity}, Required: ${item.quantity}`,
        );
      }
    }

    const totalAmount = items.reduce(
      (total, item) =>
        total + item.quantity * item.price,
      0,
    );

    return this.prisma.salesOrder.create({
      data: {
        customerId,
        totalAmount,

        items: {
          create: items.map((item) => ({
            inventoryId: item.inventoryId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },

      include: {
        customer: true,

        items: {
          include: {
            inventory: true,
          },
        },
      },
    });
  }

  // =========================================================
  // GET ALL SALES ORDERS
  // =========================================================

  async findAll() {
    return this.prisma.salesOrder.findMany({
      include: {
        customer: true,

        items: {
          include: {
            inventory: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // =========================================================
  // GET ONE SALES ORDER
  // =========================================================

  async findOne(id: number) {
    const salesOrder =
      await this.prisma.salesOrder.findUnique({
        where: { id },

        include: {
          customer: true,

          items: {
            include: {
              inventory: true,
            },
          },
        },
      });

    if (!salesOrder) {
      throw new NotFoundException(
        `Sales Order with ID ${id} not found`,
      );
    }

    return salesOrder;
  }

  // =========================================================
  // UPDATE SALES ORDER
  // =========================================================

  async update(
    id: number,
    updateSalesOrderDto: UpdateSalesOrderDto,
  ) {
    const salesOrder = await this.findOne(id);

    if (salesOrder.status === 'COMPLETED') {
      throw new BadRequestException(
        'Completed Sales Order cannot be updated',
      );
    }

    const {
      customerId,
      items,
    } = updateSalesOrderDto;

    // ---------------------------------------------------------
    // Validate customer
    // ---------------------------------------------------------

    if (customerId !== undefined) {
      const customer =
        await this.prisma.customer.findUnique({
          where: { id: customerId },
        });

      if (!customer) {
        throw new NotFoundException(
          `Customer with ID ${customerId} not found`,
        );
      }
    }

    // ---------------------------------------------------------
    // If items are supplied, replace existing items
    // ---------------------------------------------------------

    let totalAmount: number | undefined;

    if (items !== undefined) {
      if (!Array.isArray(items) || items.length === 0) {
        throw new BadRequestException(
          'At least one sales order item is required',
        );
      }

      // Validate every inventory item
      for (const item of items) {
        const inventoryItem =
          await this.prisma.inventory.findUnique({
            where: {
              id: item.inventoryId,
            },
          });

        if (!inventoryItem) {
          throw new NotFoundException(
            `Inventory item with ID ${item.inventoryId} not found`,
          );
        }

        if (inventoryItem.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.quantity}, Required: ${item.quantity}`,
          );
        }
      }

      totalAmount = items.reduce(
        (total, item) =>
          total + item.quantity * item.price,
        0,
      );
    }

    // ---------------------------------------------------------
    // Transaction
    // ---------------------------------------------------------

    return this.prisma.$transaction(async (tx) => {
      if (items !== undefined) {
        await tx.salesOrderItem.deleteMany({
          where: {
            salesOrderId: id,
          },
        });
      }

      return tx.salesOrder.update({
        where: {
          id,
        },

        data: {
          ...(customerId !== undefined && {
            customerId,
          }),

          ...(totalAmount !== undefined && {
            totalAmount,
          }),

          ...(items !== undefined && {
            items: {
              create: items.map((item) => ({
                inventoryId: item.inventoryId,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          }),
        },

        include: {
          customer: true,

          items: {
            include: {
              inventory: true,
            },
          },
        },
      });
    });
  }

  // =========================================================
  // COMPLETE SALES ORDER
  // REDUCE INVENTORY + MARK COMPLETED
  // =========================================================

  async complete(id: number) {
    const salesOrder = await this.prisma.salesOrder.findUnique({
      where: { id },

      include: {
        items: true,
      },
    });

    if (!salesOrder) {
      throw new NotFoundException(
        `Sales Order with ID ${id} not found`,
      );
    }

    if (salesOrder.status === 'COMPLETED') {
      throw new BadRequestException(
        'Sales Order has already been completed',
      );
    }

    if (
      !salesOrder.items ||
      salesOrder.items.length === 0
    ) {
      throw new BadRequestException(
        'Cannot complete an empty sales order',
      );
    }

    // =======================================================
    // Combine duplicate inventory items
    // =======================================================

    const requiredStock = new Map<
      number,
      number
    >();

    for (const item of salesOrder.items) {
      const current =
        requiredStock.get(item.inventoryId) || 0;

      requiredStock.set(
        item.inventoryId,
        current + item.quantity,
      );
    }

    // =======================================================
    // Validate stock
    // =======================================================

    for (const [
      inventoryId,
      requiredQuantity,
    ] of requiredStock.entries()) {
      const inventoryItem =
        await this.prisma.inventory.findUnique({
          where: {
            id: inventoryId,
          },
        });

      if (!inventoryItem) {
        throw new NotFoundException(
          `Inventory item with ID ${inventoryId} not found`,
        );
      }

      if (
        inventoryItem.quantity <
        requiredQuantity
      ) {
        throw new BadRequestException(
          `Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.quantity}, Required: ${requiredQuantity}`,
        );
      }
    }

    // =======================================================
    // TRANSACTION
    // =======================================================

    return this.prisma.$transaction(async (tx) => {
      // Reduce inventory
      for (const [
        inventoryId,
        requiredQuantity,
      ] of requiredStock.entries()) {
        const result =
          await tx.inventory.updateMany({
            where: {
              id: inventoryId,

              // Extra protection against stock race
              quantity: {
                gte: requiredQuantity,
              },
            },

            data: {
              quantity: {
                decrement: requiredQuantity,
              },
            },
          });

        if (result.count !== 1) {
          throw new BadRequestException(
            'Inventory stock changed before the order could be completed. Please try again.',
          );
        }
      }

      // Mark order completed
      return tx.salesOrder.update({
        where: {
          id,
        },

        data: {
          status: 'COMPLETED',
        },

        include: {
          customer: true,

          items: {
            include: {
              inventory: true,
            },
          },
        },
      });
    });
  }

  // =========================================================
  // DELETE SALES ORDER
  // =========================================================

  async remove(id: number) {
    const salesOrder = await this.findOne(id);

    if (salesOrder.status === 'COMPLETED') {
      throw new BadRequestException(
        'Completed Sales Order cannot be deleted',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.salesOrderItem.deleteMany({
        where: {
          salesOrderId: id,
        },
      });

      return tx.salesOrder.delete({
        where: {
          id,
        },
      });
    });
  }
}