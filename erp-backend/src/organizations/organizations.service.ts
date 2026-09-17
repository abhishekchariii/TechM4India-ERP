import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.organization.findMany({
      include: {
        divisions: true,
        branches: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const organization =
      await this.prisma.organization.findUnique({
        where: { id },
        include: {
          divisions: true,
          branches: true,
        },
      });

    if (!organization) {
      throw new NotFoundException(
        'Organization not found.',
      );
    }

    return organization;
  }

  async create(dto: CreateOrganizationDto) {
    return this.prisma.organization.create({
      data: {
        name: dto.name,
        legalName: dto.legalName,
        registrationDetails: dto.registrationDetails,
        website: dto.website,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        socialLinks: dto.socialLinks,
      },
    });
  }

  async update(
    id: number,
    dto: UpdateOrganizationDto,
  ) {
    await this.findOne(id);

    return this.prisma.organization.update({
      where: { id },
      data: {
        name: dto.name,
        legalName: dto.legalName,
        registrationDetails:
          dto.registrationDetails,
        website: dto.website,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        socialLinks: dto.socialLinks,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.organization.delete({
      where: { id },
    });
  }
}