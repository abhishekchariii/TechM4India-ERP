import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { CreateLeadActivityDto } from './dto/create-lead-activity.dto';
import { UpdateLeadActivityDto } from './dto/update-lead-activity.dto';

@Injectable()
export class LeadActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    leadId: number,
    dto: CreateLeadActivityDto,
  ) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with ID ${leadId} not found`,
      );
    }

    return this.prisma.leadActivity.create({
      data: {
        leadId,
        type: dto.type,
        description: dto.description,
      },
    });
  }

  async findAll(leadId: number) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with ID ${leadId} not found`,
      );
    }

    return this.prisma.leadActivity.findMany({
      where: { leadId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const activity =
      await this.prisma.leadActivity.findUnique({
        where: { id },
      });

    if (!activity) {
      throw new NotFoundException(
        `Lead activity with ID ${id} not found`,
      );
    }

    return activity;
  }

  async update(
    id: number,
    dto: UpdateLeadActivityDto,
  ) {
    await this.findOne(id);

    return this.prisma.leadActivity.update({
      where: { id },
      data: {
        type: dto.type,
        description: dto.description,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.leadActivity.delete({
      where: { id },
    });
  }
}