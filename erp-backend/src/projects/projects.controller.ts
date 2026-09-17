import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { AssignEmployeeDto } from './dto/assign-employee.dto';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @RequirePermissions('projects.manage')
  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @RequirePermissions('projects.read')
  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @RequirePermissions('projects.read')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  @RequirePermissions('projects.manage')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @RequirePermissions('projects.manage')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.remove(id);
  }

  @RequirePermissions('projects.manage')
  @Post(':projectId/employees')
  assignEmployee(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() assignEmployeeDto: AssignEmployeeDto,
  ) {
    return this.projectsService.assignEmployee(
      projectId,
      assignEmployeeDto.employeeId,
    );
  }

  @RequirePermissions('projects.read')
  @Get(':projectId/employees')
  getProjectEmployees(
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return this.projectsService.getProjectEmployees(projectId);
  }

  @RequirePermissions('projects.manage')
  @Delete(':projectId/employees/:employeeId')
  removeEmployee(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ) {
    return this.projectsService.removeEmployee(projectId, employeeId);
  }
}