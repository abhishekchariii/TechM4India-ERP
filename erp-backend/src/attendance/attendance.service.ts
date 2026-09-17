import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.attendance.findMany({
      include: {
        employee: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.attendance.findUnique({
      where: { id },
      include: {
        employee: true,
      },
    });
  }

  async create(
    employeeId: number,
    date: string,
    checkIn: string | undefined,
    checkOut: string | undefined,
    status: string,
  ) {
    return this.prisma.attendance.create({
      data: {
        employeeId,
        date: new Date(date),
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        status,
      },
      include: {
        employee: true,
      },
    });
  }

  async update(
    id: number,
    employeeId?: number,
    date?: string,
    checkIn?: string,
    checkOut?: string,
    status?: string,
  ) {
    return this.prisma.attendance.update({
      where: { id },
      data: {
        employeeId,
        date: date ? new Date(date) : undefined,
        checkIn: checkIn ? new Date(checkIn) : undefined,
        checkOut: checkOut ? new Date(checkOut) : undefined,
        status,
      },
      include: {
        employee: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.attendance.delete({
      where: { id },
    });
  }
}