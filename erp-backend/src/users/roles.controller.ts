import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

import { UsersService } from './users.service';

@Controller('roles')
export class RolesController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('roles.read')
  @Get()
  findAll() {
    return this.usersService.findAllRoles();
  }
}