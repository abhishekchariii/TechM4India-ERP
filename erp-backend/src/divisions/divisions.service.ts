import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';

@Injectable()
export class DivisionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.division.findMany({
      include: {
        organization: true,
        departments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const division =
      await this.prisma.division.findUnique({
        where: { id },
        include: {
          organization: true,
          departments: true,
        },
      });

    if (!division) {
      throw new NotFoundException(
        'Division not found.',
      );
    }

    return division;
  }

  async create(dto: CreateDivisionDto) {
    const organization =
      await this.prisma.organization.findUnique({
        where: {
          id: dto.organizationId,
        },
      });

    if (!organization) {
      throw new NotFoundException(
        'Organization not found.',
      );
    }

    return this.prisma.division.create({
      data: {
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
        organizationId: dto.organizationId,
      },
      include: {
        organization: true,
      },
    });
  }

  async update(
    id: number,
    dto: UpdateDivisionDto,
  ) {
    await this.findOne(id);

    if (dto.organizationId !== undefined) {
      const organization =
        await this.prisma.organization.findUnique({
          where: {
            id: dto.organizationId,
          },
        });

      if (!organization) {
        throw new NotFoundException(
          'Organization not found.',
        );
      }
    }

    return this.prisma.division.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive,
        organizationId: dto.organizationId,
      },
      include: {
        organization: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.division.delete({
      where: { id },
    });
  }
}