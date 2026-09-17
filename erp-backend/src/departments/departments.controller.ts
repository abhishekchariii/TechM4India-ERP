import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('departments')
export class DepartmentsController {
  constructor(private departmentsService: DepartmentsService) {}

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('departments.read')
  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('departments.read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(Number(id));
  }
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
@RequirePermissions('departments.manage')
  @Post()
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(
      createDepartmentDto.name,
    );
  }

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@RequirePermissions('departments.manage')
@Patch(':id')
update(
  @Param('id') id: string,
  @Body('name') name: string,
) {
  return this.departmentsService.update(
    Number(id),
    name,
  );
}
 @UseGuards(AuthGuard('jwt'), PermissionsGuard)
 @RequirePermissions('departments.manage')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(Number(id));
  }
}