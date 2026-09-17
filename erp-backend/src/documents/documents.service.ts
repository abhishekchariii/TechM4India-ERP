import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';

import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // CREATE
  async create(
    createDocumentDto: CreateDocumentDto,
  ) {
    return this.prisma.document.create({
      data: {
        name: createDocumentDto.name.trim(),

        description:
          createDocumentDto.description?.trim() ||
          undefined,

        fileUrl:
          createDocumentDto.fileUrl,

        fileType:
          createDocumentDto.fileType?.trim() ||
          undefined,

        fileSize:
          createDocumentDto.fileSize,

        category:
          createDocumentDto.category?.trim() ||
          undefined,

        uploadedBy:
          createDocumentDto.uploadedBy,
      },
    });
  }

  // GET ALL
  async findAll() {
    return this.prisma.document.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // GET ONE
  async findOne(id: number) {
    const document =
      await this.prisma.document.findUnique({
        where: { id },
      });

    if (!document) {
      throw new NotFoundException(
        `Document with ID ${id} not found`,
      );
    }

    return document;
  }

  // UPDATE
  async update(
    id: number,
    updateDocumentDto: UpdateDocumentDto,
  ) {
    await this.findOne(id);

    return this.prisma.document.update({
      where: { id },

      data: {
        ...(updateDocumentDto.name !==
          undefined && {
          name:
            updateDocumentDto.name.trim(),
        }),

        ...(updateDocumentDto.description !==
          undefined && {
          description:
            updateDocumentDto.description.trim(),
        }),

        ...(updateDocumentDto.fileUrl !==
          undefined && {
          fileUrl:
            updateDocumentDto.fileUrl,
        }),

        ...(updateDocumentDto.fileType !==
          undefined && {
          fileType:
            updateDocumentDto.fileType.trim(),
        }),

        ...(updateDocumentDto.fileSize !==
          undefined && {
          fileSize:
            updateDocumentDto.fileSize,
        }),

        ...(updateDocumentDto.category !==
          undefined && {
          category:
            updateDocumentDto.category.trim(),
        }),

        ...(updateDocumentDto.uploadedBy !==
          undefined && {
          uploadedBy:
            updateDocumentDto.uploadedBy,
        }),
      },
    });
  }

  // DELETE
  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.document.delete({
      where: { id },
    });
  }
}