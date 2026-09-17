import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContactDto) {
    if (dto.leadId) {
      const lead = await this.prisma.lead.findUnique({
        where: { id: dto.leadId },
      });

      if (!lead) {
        throw new NotFoundException(
          `Lead with ID ${dto.leadId} not found`,
        );
      }
    }

    return this.prisma.contact.create({
      data: {
        leadId: dto.leadId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        designation: dto.designation,
        company: dto.company,
        notes: dto.notes,
      },
    });
  }

  async findAll() {
    return this.prisma.contact.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException(
        `Contact with ID ${id} not found`,
      );
    }

    return contact;
  }

  async update(
    id: number,
    dto: UpdateContactDto,
  ) {
    await this.findOne(id);

    if (dto.leadId) {
      const lead = await this.prisma.lead.findUnique({
        where: { id: dto.leadId },
      });

      if (!lead) {
        throw new NotFoundException(
          `Lead with ID ${dto.leadId} not found`,
        );
      }
    }

    return this.prisma.contact.update({
      where: { id },
      data: {
        leadId: dto.leadId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        designation: dto.designation,
        company: dto.company,
        notes: dto.notes,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.contact.delete({
      where: { id },
    });
  }
}