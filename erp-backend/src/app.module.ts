import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DepartmentsModule } from './departments/departments.module';
import { EmployeesModule } from './employees/employees.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PayrollModule } from './payroll/payroll.module';
import { ProjectsModule } from './projects/projects.module';
import { InventoryModule } from './inventory/inventory.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { CustomersModule } from './customer/customer.module';
import { SalesOrdersModule } from './sales-orders/sales-orders.module';
import { InvoicesModule } from './invoices/invoices.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { ExpensesModule } from './expenses/expenses.module';
import { AssetsModule } from './assets/assets.module';
import { LeadsModule } from './leads/leads.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { ProgramsModule } from './programs/programs.module';
import { CmsModule } from './cms/cms.module';
import { AuditModule } from './audit/audit.module';
import { DocumentsModule } from './documents/documents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BranchesModule } from './branches/branches.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { DivisionsModule } from './divisions/divisions.module';
import { LeaveModule } from './leave/leave.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    OrganizationsModule,
    DivisionsModule,
    BranchesModule,
    UsersModule,
    AuthModule,
    DepartmentsModule,
    EmployeesModule,
    AttendanceModule,
    PayrollModule,
    ProjectsModule,
    InventoryModule,
    SuppliersModule,
    PurchaseOrdersModule,
    CustomersModule,
    SalesOrdersModule,
    InvoicesModule,
    DashboardModule,
    ReportsModule,
    ExpensesModule,
    AssetsModule,
    LeadsModule,
    InstitutionsModule,
    ProgramsModule,
    CmsModule,
    AuditModule,
    DocumentsModule,
    NotificationsModule,
    LeaveModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}