import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationsService } from './notifications.service';

@UseGuards(
  AuthGuard('jwt'),
  PermissionsGuard,
)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post()
  @RequirePermissions('notifications.manage')
  create(
    @Body()
    createNotificationDto: CreateNotificationDto,
  ) {
    return this.notificationsService.create(
      createNotificationDto,
    );
  }

  @Get()
  @RequirePermissions('notifications.read')
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('notifications.read')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('notifications.manage')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(
      id,
      updateNotificationDto,
    );
  }

  @Delete(':id')
  @RequirePermissions('notifications.manage')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.notificationsService.remove(id);
  }
}