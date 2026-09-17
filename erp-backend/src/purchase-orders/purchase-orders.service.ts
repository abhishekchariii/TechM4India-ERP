import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';

import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE
  async create(
    createPurchaseOrderDto: CreatePurchaseOrderDto,
  ) {
    const { supplierId, items } =
      createPurchaseOrderDto;

    if (!items || items.length === 0) {
      throw new BadRequestException(
        'At least one purchase order item is required',
      );
    }

    const supplier =
      await this.prisma.supplier.findUnique({
        where: { id: supplierId },
      });

    if (!supplier) {
      throw new NotFoundException(
        `Supplier with ID ${supplierId} not found`,
      );
    }

    const inventoryIds = new Set<number>();

    for (const item of items) {
      if (inventoryIds.has(item.inventoryId)) {
        throw new BadRequestException(
          `Inventory item ${item.inventoryId} cannot be added more than once`,
        );
      }

      inventoryIds.add(item.inventoryId);

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
    }

    const totalAmount = items.reduce(
      (total, item) =>
        total + item.quantity * item.price,
      0,
    );

    return this.prisma.purchaseOrder.create({
      data: {
        supplierId,
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
        supplier: true,

        items: {
          include: {
            inventory: true,
          },
        },
      },
    });
  }

  // GET ALL
  async findAll() {
    return this.prisma.purchaseOrder.findMany({
      include: {
        supplier: true,

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

  // GET ONE
  async findOne(id: number) {
    const purchaseOrder =
      await this.prisma.purchaseOrder.findUnique({
        where: { id },

        include: {
          supplier: true,

          items: {
            include: {
              inventory: true,
            },
          },
        },
      });

    if (!purchaseOrder) {
      throw new NotFoundException(
        `Purchase Order with ID ${id} not found`,
      );
    }

    return purchaseOrder;
  }

  // UPDATE
  async update(
    id: number,
    updatePurchaseOrderDto: UpdatePurchaseOrderDto,
  ) {
    const purchaseOrder =
      await this.findOne(id);

    if (purchaseOrder.status === 'RECEIVED') {
      throw new BadRequestException(
        'Received Purchase Order cannot be updated',
      );
    }

    const {
      supplierId,
      items,
    } = updatePurchaseOrderDto;

    // Validate supplier
    if (supplierId !== undefined) {
      const supplier =
        await this.prisma.supplier.findUnique({
          where: {
            id: supplierId,
          },
        });

      if (!supplier) {
        throw new NotFoundException(
          `Supplier with ID ${supplierId} not found`,
        );
      }
    }

    let totalAmount:
      | number
      | undefined;

    // Validate and replace items
    if (items !== undefined) {
      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        throw new BadRequestException(
          'At least one purchase order item is required',
        );
      }

      const inventoryIds =
        new Set<number>();

      for (const item of items) {
        if (
          inventoryIds.has(
            item.inventoryId,
          )
        ) {
          throw new BadRequestException(
            `Inventory item ${item.inventoryId} cannot be added more than once`,
          );
        }

        inventoryIds.add(
          item.inventoryId,
        );

        const inventoryItem =
          await this.prisma.inventory.findUnique(
            {
              where: {
                id: item.inventoryId,
              },
            },
          );

        if (!inventoryItem) {
          throw new NotFoundException(
            `Inventory item with ID ${item.inventoryId} not found`,
          );
        }
      }

      totalAmount = items.reduce(
        (total, item) =>
          total +
          item.quantity * item.price,
        0,
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        // Replace existing line items
        if (items !== undefined) {
          await tx.purchaseOrderItem.deleteMany(
            {
              where: {
                purchaseOrderId: id,
              },
            },
          );
        }

        return tx.purchaseOrder.update({
          where: {
            id,
          },

          data: {
            ...(supplierId !==
              undefined && {
              supplierId,
            }),

            ...(totalAmount !==
              undefined && {
              totalAmount,
            }),

            ...(items !== undefined && {
              items: {
                create: items.map(
                  (item) => ({
                    inventoryId:
                      item.inventoryId,
                    quantity:
                      item.quantity,
                    price: item.price,
                  }),
                ),
              },
            }),
          },

          include: {
            supplier: true,

            items: {
              include: {
                inventory: true,
              },
            },
          },
        });
      },
    );
  }

  // RECEIVE
  async receive(id: number) {
    const purchaseOrder =
      await this.prisma.purchaseOrder.findUnique(
        {
          where: { id },

          include: {
            items: true,
          },
        },
      );

    if (!purchaseOrder) {
      throw new NotFoundException(
        `Purchase Order with ID ${id} not found`,
      );
    }

    if (
      purchaseOrder.status ===
      'RECEIVED'
    ) {
      throw new BadRequestException(
        'Purchase Order has already been received',
      );
    }

    if (
      !purchaseOrder.items ||
      purchaseOrder.items.length === 0
    ) {
      throw new BadRequestException(
        'Cannot receive an empty purchase order',
      );
    }

    // Combine duplicate inventory IDs
    const requiredStock =
      new Map<number, number>();

    for (const item of purchaseOrder.items) {
      const current =
        requiredStock.get(
          item.inventoryId,
        ) || 0;

      requiredStock.set(
        item.inventoryId,
        current + item.quantity,
      );
    }

    // Verify inventory records
    for (const [
      inventoryId,
      quantity,
    ] of requiredStock.entries()) {
      const inventoryItem =
        await this.prisma.inventory.findUnique(
          {
            where: {
              id: inventoryId,
            },
          },
        );

      if (!inventoryItem) {
        throw new NotFoundException(
          `Inventory item with ID ${inventoryId} not found`,
        );
      }

      if (quantity < 1) {
        throw new BadRequestException(
          'Invalid purchase quantity',
        );
      }
    }

    // Atomic inventory + order update
    return this.prisma.$transaction(
      async (tx) => {
        // Re-check status inside transaction
        const currentOrder =
          await tx.purchaseOrder.findUnique(
            {
              where: { id },
            },
          );

        if (!currentOrder) {
          throw new NotFoundException(
            `Purchase Order with ID ${id} not found`,
          );
        }

        if (
          currentOrder.status ===
          'RECEIVED'
        ) {
          throw new BadRequestException(
            'Purchase Order has already been received',
          );
        }

        // Increase stock
        for (const [
          inventoryId,
          quantity,
        ] of requiredStock.entries()) {
          const result =
            await tx.inventory.updateMany(
              {
                where: {
                  id: inventoryId,
                },

                data: {
                  quantity: {
                    increment: quantity,
                  },
                },
              },
            );

          if (result.count !== 1) {
            throw new BadRequestException(
              `Failed to update inventory item ${inventoryId}`,
            );
          }
        }

        // Mark received
        return tx.purchaseOrder.update(
          {
            where: {
              id,
            },

            data: {
              status: 'RECEIVED',
            },

            include: {
              supplier: true,

              items: {
                include: {
                  inventory: true,
                },
              },
            },
          },
        );
      },
    );
  }

  // DELETE
  async remove(id: number) {
    const purchaseOrder =
      await this.findOne(id);

    if (
      purchaseOrder.status ===
      'RECEIVED'
    ) {
      throw new BadRequestException(
        'Received Purchase Order cannot be deleted',
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        await tx.purchaseOrderItem.deleteMany(
          {
            where: {
              purchaseOrderId: id,
            },
          },
        );

        return tx.purchaseOrder.delete({
          where: {
            id,
          },
        });
      },
    );
  }
}