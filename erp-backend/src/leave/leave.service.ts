import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLeaveDto: CreateLeaveDto) {
    return this.prisma.leave.create({
      data: {
        employeeId: createLeaveDto.employeeId,
        startDate: new Date(createLeaveDto.startDate),
        endDate: new Date(createLeaveDto.endDate),
        leaveType: createLeaveDto.leaveType,
        reason: createLeaveDto.reason,
        status: createLeaveDto.status ?? 'PENDING',
        approvedBy: createLeaveDto.approvedBy,
      },
    });
  }

  async findAll() {
    return this.prisma.leave.findMany({
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const leave = await this.prisma.leave.findUnique({
      where: { id },
    });

    if (!leave) {
      throw new NotFoundException(
        `Leave with ID ${id} not found`,
      );
    }

    return leave;
  }

  async update(
    id: number,
    updateLeaveDto: UpdateLeaveDto,
  ) {
    await this.findOne(id);

    return this.prisma.leave.update({
      where: { id },
      data: {
        employeeId: updateLeaveDto.employeeId,
        startDate: updateLeaveDto.startDate
          ? new Date(updateLeaveDto.startDate)
          : undefined,
        endDate: updateLeaveDto.endDate
          ? new Date(updateLeaveDto.endDate)
          : undefined,
        leaveType: updateLeaveDto.leaveType,
        reason: updateLeaveDto.reason,
        status: updateLeaveDto.status,
        approvedBy: updateLeaveDto.approvedBy,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.leave.delete({
      where: { id },
    });
  }
}