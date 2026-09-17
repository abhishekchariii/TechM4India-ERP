import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAssetDto: CreateAssetDto) {
    return this.prisma.asset.create({
      data: {
        name: createAssetDto.name,
        description: createAssetDto.description,
        category: createAssetDto.category,
        serialNumber: createAssetDto.serialNumber,
        value: createAssetDto.value,
        status: createAssetDto.status ?? 'AVAILABLE',
        location: createAssetDto.location,
        purchaseDate: createAssetDto.purchaseDate
          ? new Date(createAssetDto.purchaseDate)
          : undefined,
      },
    });
  }

  async findAll() {
    return this.prisma.asset.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundException(
        `Asset with ID ${id} not found`,
      );
    }

    return asset;
  }

  async update(
    id: number,
    updateAssetDto: UpdateAssetDto,
  ) {
    await this.findOne(id);

    return this.prisma.asset.update({
      where: { id },
      data: {
        name: updateAssetDto.name,
        description: updateAssetDto.description,
        category: updateAssetDto.category,
        serialNumber: updateAssetDto.serialNumber,
        value: updateAssetDto.value,
        status: updateAssetDto.status,
        location: updateAssetDto.location,
        purchaseDate: updateAssetDto.purchaseDate
          ? new Date(updateAssetDto.purchaseDate)
          : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.asset.delete({
      where: { id },
    });
  }
}