import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';

import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    createExpenseDto: CreateExpenseDto,
  ) {
    const amount = Number(createExpenseDto.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException(
        'Expense amount must be greater than 0',
      );
    }

    return this.prisma.expense.create({
      data: {
        title: createExpenseDto.title.trim(),

        description:
          createExpenseDto.description?.trim() ||
          undefined,

        amount,

        category:
          createExpenseDto.category.trim(),

        expenseDate:
          createExpenseDto.expenseDate
            ? new Date(
                createExpenseDto.expenseDate,
              )
            : new Date(),

        status:
          createExpenseDto.status ??
          'PENDING',
      },
    });
  }

  async findAll() {
    return this.prisma.expense.findMany({
      orderBy: [
        {
          expenseDate: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  async findOne(id: number) {
    const expense =
      await this.prisma.expense.findUnique({
        where: { id },
      });

    if (!expense) {
      throw new NotFoundException(
        `Expense with ID ${id} not found`,
      );
    }

    return expense;
  }

  async update(
    id: number,
    updateExpenseDto: UpdateExpenseDto,
  ) {
    const existing = await this.findOne(id);

    if (existing.status === 'PAID') {
      throw new BadRequestException(
        'Paid expenses cannot be edited',
      );
    }

    if (
      updateExpenseDto.amount !== undefined
    ) {
      const amount = Number(
        updateExpenseDto.amount,
      );

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new BadRequestException(
          'Expense amount must be greater than 0',
        );
      }
    }

    return this.prisma.expense.update({
      where: { id },

      data: {
        ...(updateExpenseDto.title !== undefined && {
          title:
            updateExpenseDto.title.trim(),
        }),

        ...(updateExpenseDto.description !==
          undefined && {
          description:
            updateExpenseDto.description.trim() ||
            null,
        }),

        ...(updateExpenseDto.amount !==
          undefined && {
          amount: Number(
            updateExpenseDto.amount,
          ),
        }),

        ...(updateExpenseDto.category !==
          undefined && {
          category:
            updateExpenseDto.category.trim(),
        }),

        ...(updateExpenseDto.expenseDate !==
          undefined && {
          expenseDate: new Date(
            updateExpenseDto.expenseDate,
          ),
        }),

        ...(updateExpenseDto.status !==
          undefined && {
          status: updateExpenseDto.status,
        }),
      },
    });
  }

  async remove(id: number) {
    const existing = await this.findOne(id);

    if (existing.status === 'PAID') {
      throw new BadRequestException(
        'Paid expenses cannot be deleted',
      );
    }

    return this.prisma.expense.delete({
      where: { id },
    });
  }
}