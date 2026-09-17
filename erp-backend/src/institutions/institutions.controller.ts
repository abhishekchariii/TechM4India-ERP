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

import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('institutions')
export class InstitutionsController {
  constructor(
    private readonly institutionsService: InstitutionsService,
  ) {}

  @RequirePermissions('institutions.manage')
  @Post()
  create(@Body() createInstitutionDto: CreateInstitutionDto) {
    return this.institutionsService.create(createInstitutionDto);
  }

  @RequirePermissions('institutions.read')
  @Get()
  findAll() {
    return this.institutionsService.findAll();
  }

  @RequirePermissions('institutions.read')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.institutionsService.findOne(id);
  }

  @RequirePermissions('institutions.manage')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInstitutionDto: UpdateInstitutionDto,
  ) {
    return this.institutionsService.update(
      id,
      updateInstitutionDto,
    );
  }

  @RequirePermissions('institutions.manage')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.institutionsService.remove(id);
  }
}