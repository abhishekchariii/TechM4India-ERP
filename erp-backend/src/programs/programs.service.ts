import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Injectable()
export class ProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProgramDto) {
    if (dto.institutionId !== undefined) {
      const institution = await this.prisma.institution.findUnique({
        where: { id: dto.institutionId },
      });

      if (!institution) {
        throw new NotFoundException(
          `Institution with ID ${dto.institutionId} not found`,
        );
      }
    }

    return this.prisma.program.create({
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        category: dto.category,
        duration: dto.duration,
        fee: dto.fee,
        status: dto.status ?? 'ACTIVE',
        institutionId: dto.institutionId,
      },
      include: {
        institution: true,
      },
    });
  }

  async findAll() {
    return this.prisma.program.findMany({
      include: {
        institution: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const program = await this.prisma.program.findUnique({
      where: { id },
      include: {
        institution: true,
      },
    });

    if (!program) {
      throw new NotFoundException(
        `Program with ID ${id} not found`,
      );
    }

    return program;
  }

  async update(id: number, dto: UpdateProgramDto) {
    await this.findOne(id);

    if (dto.institutionId !== undefined) {
      const institution = await this.prisma.institution.findUnique({
        where: { id: dto.institutionId },
      });

      if (!institution) {
        throw new NotFoundException(
          `Institution with ID ${dto.institutionId} not found`,
        );
      }
    }

    return this.prisma.program.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        category: dto.category,
        duration: dto.duration,
        fee: dto.fee,
        status: dto.status,
        institutionId: dto.institutionId,
      },
      include: {
        institution: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.program.delete({
      where: { id },
    });
  }
}