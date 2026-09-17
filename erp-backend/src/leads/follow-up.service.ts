import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';

@Injectable()
export class FollowUpService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    leadId: number,
    dto: CreateFollowUpDto,
  ) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with ID ${leadId} not found`,
      );
    }

    return this.prisma.followUp.create({
      data: {
        leadId,
        followUpAt: new Date(dto.followUpAt),
        type: dto.type,
        notes: dto.notes,
        status: dto.status ?? 'PENDING',
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

    return this.prisma.followUp.findMany({
      where: { leadId },
      orderBy: {
        followUpAt: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const followUp = await this.prisma.followUp.findUnique({
      where: { id },
    });

    if (!followUp) {
      throw new NotFoundException(
        `Follow-up with ID ${id} not found`,
      );
    }

    return followUp;
  }

  async update(
    id: number,
    dto: UpdateFollowUpDto,
  ) {
    await this.findOne(id);

    return this.prisma.followUp.update({
      where: { id },
      data: {
        followUpAt: dto.followUpAt
          ? new Date(dto.followUpAt)
          : undefined,
        type: dto.type,
        notes: dto.notes,
        status: dto.status,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.followUp.delete({
      where: { id },
    });
  }
}