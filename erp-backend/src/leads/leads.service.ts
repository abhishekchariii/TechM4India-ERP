import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: {
        name: createLeadDto.name,
        email: createLeadDto.email,
        phone: createLeadDto.phone,
        company: createLeadDto.company,
        city: createLeadDto.city,
        type: createLeadDto.type,
        source: createLeadDto.source,
        status: createLeadDto.status ?? 'NEW',
        priority: createLeadDto.priority ?? 'MEDIUM',
        interestedProgram: createLeadDto.interestedProgram,
        assignedEmployeeId: createLeadDto.assignedEmployeeId,
        estimatedValue: createLeadDto.estimatedValue,
        notes: createLeadDto.notes,
        nextFollowUp: createLeadDto.nextFollowUp
          ? new Date(createLeadDto.nextFollowUp)
          : undefined,
      },
    });
  }

  async findAll(query: QueryLeadsDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        {
          name: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          phone: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          company: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          city: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.source) {
      where.source = query.source;
    }

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prisma.lead.count({
        where,
      }),
    ]);

    return {
      data: leads,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with ID ${id} not found`,
      );
    }

    return lead;
  }

  async update(
    id: number,
    updateLeadDto: UpdateLeadDto,
  ) {
    await this.findOne(id);

    return this.prisma.lead.update({
      where: { id },
      data: {
        name: updateLeadDto.name,
        email: updateLeadDto.email,
        phone: updateLeadDto.phone,
        company: updateLeadDto.company,
        city: updateLeadDto.city,
        type: updateLeadDto.type,
        source: updateLeadDto.source,
        status: updateLeadDto.status,
        priority: updateLeadDto.priority,
        interestedProgram: updateLeadDto.interestedProgram,
        assignedEmployeeId: updateLeadDto.assignedEmployeeId,
        estimatedValue: updateLeadDto.estimatedValue,
        notes: updateLeadDto.notes,
        nextFollowUp: updateLeadDto.nextFollowUp
          ? new Date(updateLeadDto.nextFollowUp)
          : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.lead.delete({
      where: { id },
    });
  }
}