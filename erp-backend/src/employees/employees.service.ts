import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  // GET all employees
  async findAll() {
    return this.prisma.employee.findMany({
      include: {
        department: true,
      },
    });
  }

  // GET one employee
  async findOne(id: number) {
    return this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
      },
    });
  }

  // CREATE employee
  async create(
    name: string,
    email: string,
    phone: string | undefined,
    position: string,
    departmentId: number,
  ) {
    return this.prisma.employee.create({
      data: {
        name,
        email,
        phone,
        position,
        departmentId,
      },
      include: {
        department: true,
      },
    });
  }

  // UPDATE employee
  async update(
    id: number,
    name: string,
    email: string,
    phone: string | undefined,
    position: string,
    departmentId: number,
  ) {
    return this.prisma.employee.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        position,
        departmentId,
      },
      include: {
        department: true,
      },
    });
  }

  // DELETE employee
  async remove(id: number) {
    return this.prisma.employee.delete({
      where: { id },
    });
  }
}