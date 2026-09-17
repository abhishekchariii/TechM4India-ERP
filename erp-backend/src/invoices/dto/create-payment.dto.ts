import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsString()
  @IsIn([
    'CASH',
    'BANK_TRANSFER',
    'UPI',
    'CARD',
    'CHEQUE',
    'RAZORPAY',
  ])
  paymentMethod: string;
}