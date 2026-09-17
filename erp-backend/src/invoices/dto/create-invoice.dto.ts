import {
  IsDateString,
  IsInt,
} from 'class-validator';

export class CreateInvoiceDto {
  @IsInt()
  salesOrderId: number;

  @IsDateString()
  dueDate?: string;
}