import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { PermissionsGuard } from './permissions.guard';
import { RequirePermissions } from './permissions.decorator';
import { AuditService } from '../audit/audit.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
  ) {}

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(email, password);
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('users.create')
  @Post('register')
  async register(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Req() request: any,
  ) {
    const user = await this.authService.register(
      name,
      email,
      password,
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
}