import {
  IsIn,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateLeadActivityDto {
  @IsIn([
    'CALL',
    'EMAIL',
    'WHATSAPP',
    'MEETING',
    'NOTE',
    'OTHER',
  ])
  type: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}