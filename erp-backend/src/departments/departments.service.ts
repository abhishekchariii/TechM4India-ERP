import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  // Get all departments
  async findAll() {
    return this.prisma.department.findMany();
  }

  // Get one department by ID
  async findOne(id: number) {
    return this.prisma.department.findUnique({
      where: {
        id,
      },
    });
  }

  // Create a department
  async create(name: string) {
    return this.prisma.department.create({
      data: {
        name,
      },
    });
  }

  // Update a department
  async update(id: number, name: string) {
    return this.prisma.department.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
  }

  // Delete a department
  async remove(id: number) {
    return this.prisma.department.delete({
      where: {
        id,
      },
    });
  }
}