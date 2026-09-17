import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // GET ALL USERS
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  // GET ONE USER
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // CREATE USER
  async create(
    name: string,
    email: string,
    password: string,
  ) {
    const existingUser =
      await this.prisma.user.findUnique({
        where: { email },
      });

    if (existingUser) {
      throw new ConflictException(
        'User with this email already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10,
    );

    return this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // UPDATE USER
  async update(
    id: number,
    name?: string,
    email?: string,
    password?: string,
  ) {
    await this.findOne(id);

    if (email !== undefined) {
      const existingUser =
        await this.prisma.user.findUnique({
          where: { email },
        });

      if (
        existingUser &&
        existingUser.id !== id
      ) {
        throw new ConflictException(
          'User with this email already exists',
        );
      }
    }

    const data: {
      name?: string;
      email?: string;
      password?: string;
    } = {};

    if (name !== undefined) {
      data.name = name;
    }

    if (email !== undefined) {
      data.email = email;
    }

    if (password !== undefined) {
      data.password = await bcrypt.hash(
        password,
        10,
      );
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // DELETE USER
  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // GET USER ROLES
  async getRoles(userId: number) {
    await this.findOne(userId);

    return this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        roleId: 'asc',
      },
    });
  }

  // GET ALL ROLES
  async findAllRoles() {
    return this.prisma.role.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  // ASSIGN ROLE
  async assignRole(
    userId: number,
    roleId: number,
  ) {
    await this.findOne(userId);

    const role =
      await this.prisma.role.findUnique({
        where: { id: roleId },
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
        },
      });

    if (!role) {
      throw new NotFoundException(
        `Role with ID ${roleId} not found`,
      );
    }

    if (!role.isActive) {
      throw new ConflictException(
        `Role ${role.name} is inactive and cannot be assigned`,
      );
    }

    const existingAssignment =
      await this.prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
      });

    if (existingAssignment) {
      throw new ConflictException(
        `Role ${role.name} is already assigned to this user`,
      );
    }

    return this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
          },
        },
      },
    });
  }

  // REMOVE ROLE
  async removeRole(
    userId: number,
    roleId: number,
  ) {
    const assignment =
      await this.prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
        include: {
          role: {
            select: {
              id: true,
              name: true,
              description: true,
              isActive: true,
            },
          },
        },
      });

    if (!assignment) {
      throw new NotFoundException(
        `Role ${roleId} is not assigned to user ${userId}`,
      );
    }

    return this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
          },
        },
      },
    });
  }
}