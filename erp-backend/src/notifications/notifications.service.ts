import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';

import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // CREATE
  async create(
    createNotificationDto: CreateNotificationDto,
  ) {
    if (
      createNotificationDto.userId !==
      undefined
    ) {
      const user =
        await this.prisma.user.findUnique({
          where: {
            id: createNotificationDto.userId,
          },
        });

      if (!user) {
        throw new NotFoundException(
          `User with ID ${createNotificationDto.userId} not found`,
        );
      }
    }

    return this.prisma.notification.create({
      data: {
        title:
          createNotificationDto.title.trim(),

        message:
          createNotificationDto.message.trim(),

        type:
          createNotificationDto.type?.trim() ||
          undefined,

        isRead:
          createNotificationDto.isRead ??
          false,

        userId:
          createNotificationDto.userId,
      },
    });
  }

  // GET ALL
  async findAll() {
    return this.prisma.notification.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // GET ONE
  async findOne(id: number) {
    const notification =
      await this.prisma.notification.findUnique({
        where: { id },
      });

    if (!notification) {
      throw new NotFoundException(
        `Notification with ID ${id} not found`,
      );
    }

    return notification;
  }

  // UPDATE
  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ) {
    await this.findOne(id);

    if (
      updateNotificationDto.userId !==
      undefined
    ) {
      const user =
        await this.prisma.user.findUnique({
          where: {
            id: updateNotificationDto.userId,
          },
        });

      if (!user) {
        throw new NotFoundException(
          `User with ID ${updateNotificationDto.userId} not found`,
        );
      }
    }

    if (
      updateNotificationDto.title !==
        undefined &&
      !updateNotificationDto.title.trim()
    ) {
      throw new BadRequestException(
        'Notification title cannot be empty',
      );
    }

    if (
      updateNotificationDto.message !==
        undefined &&
      !updateNotificationDto.message.trim()
    ) {
      throw new BadRequestException(
        'Notification message cannot be empty',
      );
    }

    return this.prisma.notification.update({
      where: { id },

      data: {
        ...(updateNotificationDto.title !==
          undefined && {
          title:
            updateNotificationDto.title.trim(),
        }),

        ...(updateNotificationDto.message !==
          undefined && {
          message:
            updateNotificationDto.message.trim(),
        }),

        ...(updateNotificationDto.type !==
          undefined && {
          type:
            updateNotificationDto.type.trim(),
        }),

        ...(updateNotificationDto.isRead !==
          undefined && {
          isRead:
            updateNotificationDto.isRead,
        }),

        ...(updateNotificationDto.userId !==
          undefined && {
          userId:
            updateNotificationDto.userId,
        }),
      },
    });
  }

  // DELETE
  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.notification.delete({
      where: { id },
    });
  }
}