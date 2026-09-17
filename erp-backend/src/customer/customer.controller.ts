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

import { CustomersService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
  ) {}

 @Post()
 @RequirePermissions('customers.manage')
 create(@Body() createCustomerDto: CreateCustomerDto) {
  return this.customersService.create(createCustomerDto);
}

  @Get()
 @RequirePermissions('customers.read')
 findAll() {
  return this.customersService.findAll();
}

 @Get(':id')
 @RequirePermissions('customers.read')
 findOne(@Param('id', ParseIntPipe) id: number) {
  return this.customersService.findOne(id);
}

  @Patch(':id')
 @RequirePermissions('customers.manage')
 update(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateCustomerDto: UpdateCustomerDto,
) {
  return this.customersService.update(id, updateCustomerDto);
}
 @Delete(':id')
 @RequirePermissions('customers.manage')
 remove(@Param('id', ParseIntPipe) id: number) {
  return this.customersService.remove(id);
}
}