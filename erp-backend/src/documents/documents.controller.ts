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

import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentsService } from './documents.service';

@UseGuards(
  AuthGuard('jwt'),
  PermissionsGuard,
)
@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
  ) {}

  @Post()
  @RequirePermissions('documents.manage')
  create(
    @Body()
    createDocumentDto: CreateDocumentDto,
  ) {
    return this.documentsService.create(
      createDocumentDto,
    );
  }

  @Get()
  @RequirePermissions('documents.read')
  findAll() {
    return this.documentsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('documents.read')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('documents.manage')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(
      id,
      updateDocumentDto,
    );
  }

  @Delete(':id')
  @RequirePermissions('documents.manage')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.documentsService.remove(id);
  }
}