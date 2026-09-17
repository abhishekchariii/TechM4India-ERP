import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { UsersService } from './users.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';

import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { AuditService } from '../audit/audit.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  // GET USERS
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('users.read')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // GET USER
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('users.read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(
      Number(id),
    );
  }

  // GET USER ROLES
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('roles.read')
  @Get(':id/roles')
  getRoles(@Param('id') id: string) {
    return this.usersService.getRoles(
      Number(id),
    );
  }

  // CREATE USER
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('users.create')
  @Post()
  async create(
    @Body() dto: CreateUserDto,
    @Req() request: any,
  ) {
    const user =
      await this.usersService.create(
        dto.name,
        dto.email,
        dto.password,
      );

    await this.auditService.create({
      userId: request.user.userId,
      action: 'CREATE',
      entity: 'User',
      entityId: user.id,
      description: `Created user ${user.email}`,
      newData: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    return user;
  }

  // ASSIGN ROLE
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('roles.manage')
  @Post(':id/roles')
  async assignRole(
    @Param('id') id: string,
    @Body() dto: AssignRoleDto,
    @Req() request: any,
  ) {
    const userId = Number(id);

    const assignment =
      await this.usersService.assignRole(
        userId,
        dto.roleId,
      );

    await this.auditService.create({
      userId: request.user.userId,
      action: 'ASSIGN_ROLE',
      entity: 'UserRole',
      entityId: assignment.id,
      description: `Assigned role ${assignment.role.name} to user ${userId}`,
      newData: {
        userId,
        roleId: assignment.role.id,
        roleName: assignment.role.name,
      },
    });

    return assignment;
  }

  // UPDATE USER
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('users.manage')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() request: any,
  ) {
    const userId = Number(id);

    const oldUser =
      await this.usersService.findOne(userId);

    const user =
      await this.usersService.update(
        userId,
        dto.name,
        dto.email,
        dto.password,
      );

    await this.auditService.create({
      userId: request.user.userId,
      action: 'UPDATE',
      entity: 'User',
      entityId: user.id,
      description: `Updated user ${user.email}`,
      oldData: {
        id: oldUser.id,
        name: oldUser.name,
        email: oldUser.email,
      },
      newData: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    return user;
  }

  // REMOVE ROLE
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('roles.manage')
  @Delete(':id/roles/:roleId')
  async removeRole(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
    @Req() request: any,
  ) {
    const userId = Number(id);
    const parsedRoleId = Number(roleId);

    const assignment =
      await this.usersService.removeRole(
        userId,
        parsedRoleId,
      );

    await this.auditService.create({
      userId: request.user.userId,
      action: 'REMOVE_ROLE',
      entity: 'UserRole',
      entityId: assignment.id,
      description: `Removed role ${assignment.role.name} from user ${userId}`,
      oldData: {
        userId,
        roleId: assignment.role.id,
        roleName: assignment.role.name,
      },
    });

    return assignment;
  }

  // DELETE USER
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('users.manage')
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() request: any,
  ) {
    const user =
      await this.usersService.remove(
        Number(id),
      );

    await this.auditService.create({
      userId: request.user.userId,
      action: 'DELETE',
      entity: 'User',
      entityId: user.id,
      description: `Deleted user ${user.email}`,
      oldData: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    return user;
  }
}