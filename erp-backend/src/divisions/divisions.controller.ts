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

import { DivisionsService } from './divisions.service';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';

import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('divisions')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class DivisionsController {
  constructor(
    private readonly divisionsService: DivisionsService,
  ) {}

  @Get()
  @RequirePermissions('divisions.read')
  findAll() {
    return this.divisionsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('divisions.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.divisionsService.findOne(id);
  }

  @Post()
  @RequirePermissions('divisions.manage')
  create(@Body() dto: CreateDivisionDto) {
    return this.divisionsService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('divisions.manage')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDivisionDto,
  ) {
    return this.divisionsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('divisions.manage')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.divisionsService.remove(id);
  }
}