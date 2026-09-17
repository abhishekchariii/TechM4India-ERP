import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@Injectable()
export class InstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInstitutionDto: CreateInstitutionDto) {
    return this.prisma.institution.create({
      data: {
        name: createInstitutionDto.name,
        code: createInstitutionDto.code,
        type: createInstitutionDto.type,
        email: createInstitutionDto.email,
        phone: createInstitutionDto.phone,
        address: createInstitutionDto.address,
        city: createInstitutionDto.city,
        state: createInstitutionDto.state,
        website: createInstitutionDto.website,
        contactName: createInstitutionDto.contactName,
        status: createInstitutionDto.status ?? 'ACTIVE',
        notes: createInstitutionDto.notes,
      },
    });
  }

  async findAll() {
    return this.prisma.institution.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
    });

    if (!institution) {
      throw new NotFoundException(
        `Institution with ID ${id} not found`,
      );
    }

    return institution;
  }

  async update(
    id: number,
    updateInstitutionDto: UpdateInstitutionDto,
  ) {
    await this.findOne(id);

    return this.prisma.institution.update({
      where: { id },
      data: {
        name: updateInstitutionDto.name,
        code: updateInstitutionDto.code,
        type: updateInstitutionDto.type,
        email: updateInstitutionDto.email,
        phone: updateInstitutionDto.phone,
        address: updateInstitutionDto.address,
        city: updateInstitutionDto.city,
        state: updateInstitutionDto.state,
        website: updateInstitutionDto.website,
        contactName: updateInstitutionDto.contactName,
        status: updateInstitutionDto.status,
        notes: updateInstitutionDto.notes,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.institution.delete({
      where: { id },
    });
  }
}