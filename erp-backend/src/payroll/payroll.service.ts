import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';

@Injectable()
export class PayrollService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // GET ALL PAYROLL
  async findAll() {
    return this.prisma.payroll.findMany({
      include: {
        employee: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  // GET ONE PAYROLL
  async findOne(id: number) {
    const payroll =
      await this.prisma.payroll.findUnique({
        where: { id },
        include: {
          employee: true,
        },
      });

    if (!payroll) {
      throw new NotFoundException(
        `Payroll record with ID ${id} not found`,
      );
    }

    return payroll;
  }

  // CREATE PAYROLL
  async create(
    employeeId: number,
    basicSalary: number,
    bonus = 0,
    deductions = 0,
    month: string,
  ) {
    if (basicSalary < 0) {
      throw new BadRequestException(
        'Basic salary cannot be negative',
      );
    }

    if (bonus < 0) {
      throw new BadRequestException(
        'Bonus cannot be negative',
      );
    }

    if (deductions < 0) {
      throw new BadRequestException(
        'Deductions cannot be negative',
      );
    }

    const employee =
      await this.prisma.employee.findUnique({
        where: { id: employeeId },
      });

    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${employeeId} not found`,
      );
    }

    const cleanMonth = month.trim();

    if (!cleanMonth) {
      throw new BadRequestException(
        'Payroll month is required',
      );
    }

    const netSalary =
      basicSalary + bonus - deductions;

    if (netSalary < 0) {
      throw new BadRequestException(
        'Deductions cannot exceed basic salary plus bonus',
      );
    }

    // Prevent duplicate payroll for the same employee/month.
    const existing =
      await this.prisma.payroll.findFirst({
        where: {
          employeeId,
          month: cleanMonth,
        },
      });

    if (existing) {
      throw new BadRequestException(
        `Payroll already exists for this employee for ${cleanMonth}`,
      );
    }

    return this.prisma.payroll.create({
      data: {
        employeeId,
        basicSalary,
        bonus,
        deductions,
        netSalary,
        month: cleanMonth,
      },
      include: {
        employee: true,
      },
    });
  }

  // UPDATE PAYROLL
  async update(
    id: number,
    employeeId?: number,
    basicSalary?: number,
    bonus?: number,
    deductions?: number,
    month?: string,
  ) {
    const existing =
      await this.prisma.payroll.findUnique({
        where: { id },
      });

    if (!existing) {
      throw new NotFoundException(
        `Payroll record with ID ${id} not found`,
      );
    }

    if (
      employeeId !== undefined
    ) {
      const employee =
        await this.prisma.employee.findUnique({
          where: { id: employeeId },
        });

      if (!employee) {
        throw new NotFoundException(
          `Employee with ID ${employeeId} not found`,
        );
      }
    }

    const finalBasicSalary =
      basicSalary ?? existing.basicSalary;

    const finalBonus =
      bonus ?? existing.bonus;

    const finalDeductions =
      deductions ?? existing.deductions;

    if (finalBasicSalary < 0) {
      throw new BadRequestException(
        'Basic salary cannot be negative',
      );
    }

    if (finalBonus < 0) {
      throw new BadRequestException(
        'Bonus cannot be negative',
      );
    }

    if (finalDeductions < 0) {
      throw new BadRequestException(
        'Deductions cannot be negative',
      );
    }

    const finalMonth =
      month !== undefined
        ? month.trim()
        : existing.month;

    if (!finalMonth) {
      throw new BadRequestException(
        'Payroll month is required',
      );
    }

    const finalEmployeeId =
      employeeId ?? existing.employeeId;

    const duplicate =
      await this.prisma.payroll.findFirst({
        where: {
          employeeId: finalEmployeeId,
          month: finalMonth,
          NOT: {
            id,
          },
        },
      });

    if (duplicate) {
      throw new BadRequestException(
        `Payroll already exists for this employee for ${finalMonth}`,
      );
    }

    const netSalary =
      finalBasicSalary +
      finalBonus -
      finalDeductions;

    if (netSalary < 0) {
      throw new BadRequestException(
        'Deductions cannot exceed basic salary plus bonus',
      );
    }

    return this.prisma.payroll.update({
      where: { id },

      data: {
        ...(employeeId !== undefined && {
          employeeId,
        }),

        ...(basicSalary !== undefined && {
          basicSalary,
        }),

        ...(bonus !== undefined && {
          bonus,
        }),

        ...(deductions !== undefined && {
          deductions,
        }),

        ...(month !== undefined && {
          month: finalMonth,
        }),

        netSalary,
      },

      include: {
        employee: true,
      },
    });
  }

  // DELETE PAYROLL
  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.payroll.delete({
      where: { id },
    });
  }
}