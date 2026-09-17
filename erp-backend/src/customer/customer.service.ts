import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE CUSTOMER
  async create(createCustomerDto: CreateCustomerDto) {
    const existingCustomer = await this.prisma.customer.findUnique({
      where: {
        email: createCustomerDto.email,
      },
    });

    if (existingCustomer) {
      throw new ConflictException(
        'Customer with this email already exists',
      );
    }

    return this.prisma.customer.create({
      data: createCustomerDto,
    });
  }

  // GET ALL CUSTOMERS
  async findAll() {
    return this.prisma.customer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // GET ONE CUSTOMER
  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(
        `Customer with ID ${id} not found`,
      );
    }

    return customer;
  }

  // UPDATE CUSTOMER
  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ) {
    await this.findOne(id);

    if (updateCustomerDto.email) {
      const existingCustomer = await this.prisma.customer.findUnique({
        where: {
          email: updateCustomerDto.email,
        },
      });

      if (existingCustomer && existingCustomer.id !== id) {
        throw new ConflictException(
          'Customer with this email already exists',
        );
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  
 // DELETE CUSTOMER
 async remove(id: number) {
  await this.findOne(id);

  const salesOrderCount = await this.prisma.salesOrder.count({
    where: {
      customerId: id,
    },
  });

  if (salesOrderCount > 0) {
    throw new ConflictException(
      `Cannot delete customer because ${salesOrderCount} sales order${
        salesOrderCount === 1 ? '' : 's'
      } ${salesOrderCount === 1 ? 'is' : 'are'} associated with this customer.`,
    );
  }

  return this.prisma.customer.delete({
    where: { id },
  });
 }
}