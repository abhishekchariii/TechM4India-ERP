import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.branch.findMany({
      include: {
        organization: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    return branch;
  }

  async create(dto: CreateBranchDto) {
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

    return this.prisma.branch.create({
      data: {
        name: dto.name,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        phone: dto.phone,
        email: dto.email,
        isActive: dto.isActive ?? true,
        organizationId: dto.organizationId,
      },
      include: {
        organization: true,
      },
    });
  }

  async update(id: number, dto: UpdateBranchDto) {
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

    return this.prisma.branch.update({
      where: { id },
      data: {
        name: dto.name,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        phone: dto.phone,
        email: dto.email,
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

    return this.prisma.branch.delete({
      where: { id },
    });
  }
}