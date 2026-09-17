import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFollowUpDto {
  @IsDateString()
  followUpAt: string;

  @IsOptional()
  @IsIn([
    'CALL',
    'EMAIL',
    'WHATSAPP',
    'MEETING',
    'OTHER',
  ])
  type?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn([
    'PENDING',
    'COMPLETED',
    'CANCELLED',
  ])
  status?: string;
}