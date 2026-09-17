import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryLeadsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn([
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'MEETING',
    'PROPOSAL',
    'NEGOTIATION',
    'WON',
    'LOST',
  ])
  status?: string;

  @IsOptional()
  @IsIn([
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT',
  ])
  priority?: string;

  @IsOptional()
  @IsIn([
    'STUDENT',
    'SCHOOL',
    'COLLEGE',
    'UNIVERSITY',
    'CORPORATE',
    'GOVERNMENT',
    'CSR',
    'PARTNER',
    'VENDOR',
    'OTHER',
  ])
  type?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}