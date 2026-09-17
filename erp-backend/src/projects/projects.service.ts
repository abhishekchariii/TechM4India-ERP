import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        ...createProjectDto,
        startDate: new Date(createProjectDto.startDate),
        endDate: createProjectDto.endDate
          ? new Date(createProjectDto.endDate)
          : null,
      },
    });
  }

  async findAll() {
    return this.prisma.project.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    await this.findOne(id);

    return this.prisma.project.update({
      where: { id },
      data: {
        ...updateProjectDto,
        ...(updateProjectDto.startDate && {
          startDate: new Date(updateProjectDto.startDate),
        }),
        ...(updateProjectDto.endDate && {
          endDate: new Date(updateProjectDto.endDate),
        }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.project.delete({
      where: { id },
    });
  }
  async assignEmployee(projectId: number, employeeId: number) {
  await this.findOne(projectId);

  const employee = await this.prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    throw new NotFoundException(
      `Employee with ID ${employeeId} not found`,
    );
  }

  return this.prisma.project.update({
    where: { id: projectId },
    data: {
      employees: {
        connect: { id: employeeId },
      },
    },
    include: {
      employees: true,
    },
  });
}

async getProjectEmployees(projectId: number) {
  await this.findOne(projectId);

  return this.prisma.project.findUnique({
    where: { id: projectId },
    include: {
      employees: true,
    },
  });
}

async removeEmployee(projectId: number, employeeId: number) {
  await this.findOne(projectId);

  return this.prisma.project.update({
    where: { id: projectId },
    data: {
      employees: {
        disconnect: { id: employeeId },
      },
    },
    include: {
      employees: true,
    },
  });
}
}