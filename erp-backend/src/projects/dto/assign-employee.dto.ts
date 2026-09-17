import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignEmployeeDto {
  @IsNotEmpty()
  @IsInt()
  employeeId: number;
}