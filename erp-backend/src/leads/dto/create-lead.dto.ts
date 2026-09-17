import {
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLeadDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  city?: string;

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
  @IsIn([
    'WEBSITE',
    'REFERRAL',
    'LINKEDIN',
    'INSTAGRAM',
    'WHATSAPP',
    'EVENT',
    'COLLEGE_OUTREACH',
    'SCHOOL_OUTREACH',
    'ADVERTISEMENT',
    'DIRECT',
    'OTHER',
  ])
  source?: string;

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
  @IsString()
  interestedProgram?: string;

  @IsOptional()
  @IsNumber()
  assignedEmployeeId?: number;

  @IsOptional()
  @IsNumber()
  estimatedValue?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  nextFollowUp?: string;
}