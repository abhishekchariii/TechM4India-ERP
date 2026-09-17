import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const roles = [
  {
    name: 'SUPER_ADMIN',
    description: 'Full access to the ERP system.',
  },
  {
    name: 'DIRECTOR',
    description:
      'Executive-level access to company operations and reports.',
  },
  {
    name: 'DIVISION_HEAD',
    description:
      'Manages operations within an assigned division.',
  },
  {
    name: 'HR_MANAGER',
    description:
      'Manages employees, attendance, leave and HR operations.',
  },
  {
    name: 'SALES_MANAGER',
    description:
      'Manages CRM, leads, institutions and sales operations.',
  },
  {
    name: 'SALES_EXECUTIVE',
    description:
      'Handles assigned leads, follow-ups and sales activities.',
  },
  {
    name: 'FINANCE_MANAGER',
    description:
      'Manages invoices, payments, expenses and finance visibility.',
  },
  {
    name: 'PROJECT_MANAGER',
    description:
      'Manages projects, project teams, tasks and deadlines.',
  },
  {
    name: 'EMPLOYEE',
    description:
      'Standard employee access to assigned ERP functionality.',
  },
  {
    name: 'CONTENT_MANAGER',
    description:
      'Manages and publishes website CMS content.',
  },
  {
    name: 'VIEWER',
    description:
      'Read-only access to permitted ERP information.',
  },
];

const permissions = [
  {
    name: 'dashboard.read',
    description: 'View dashboard information.',
  },

  {
    name: 'users.read',
    description: 'View users.',
  },
  {
    name: 'users.create',
    description: 'Create users.',
  },
  {
    name: 'users.update',
    description: 'Update users.',
  },
  {
    name: 'users.delete',
    description: 'Delete or deactivate users.',
  },

  {
    name: 'roles.read',
    description: 'View roles and permissions.',
  },
  {
    name: 'roles.manage',
    description: 'Manage roles and permissions.',
  },

  {
    name: 'employees.read',
    description: 'View employees.',
  },
  {
    name: 'employees.manage',
    description: 'Create and manage employees.',
  },

  {
    name: 'customers.read',
    description: 'View customers.',
  },
  {
    name: 'customers.manage',
    description: 'Create and manage customers.',
  },
  {
  name: 'leads.read',
  description: 'View leads.',
},
  {
  name: 'leads.manage',
  description: 'Create and manage leads.',
  },

  {
    name: 'departments.read',
    description: 'View departments.',
  },
  {
    name: 'departments.manage',
    description: 'Create and manage departments.',
  },

  {
    name: 'attendance.read',
    description: 'View attendance records.',
  },
  {
    name: 'attendance.manage',
    description: 'Manage attendance records.',
  },

  {
    name: 'leads.read',
    description: 'View CRM leads.',
  },
  {
    name: 'leads.manage',
    description: 'Create and manage CRM leads.',
  },

  {
    name: 'institutions.read',
    description: 'View institutions.',
  },
  {
    name: 'institutions.manage',
    description: 'Create and manage institutions.',
  },

  {
    name: 'programs.read',
    description: 'View programs.',
  },
  {
    name: 'programs.manage',
    description: 'Create and manage programs.',
  },

  {
    name: 'projects.read',
    description: 'View projects.',
  },
  {
    name: 'projects.manage',
    description: 'Create and manage projects.',
  },
  {
  name: 'sales_orders.read',
  description: 'View sales orders.',
  },
  {
  name: 'sales_orders.manage',
  description: 'Create and manage sales orders.',
  },
  {
  name: 'purchase_orders.read',
  description: 'View purchase orders.',
  },
  {
  name: 'purchase_orders.manage',
  description: 'Create and manage purchase orders.',
  },
    {
    name: 'payroll.read',
    description: 'View payroll records.',
  },
  {
    name: 'payroll.manage',
    description: 'Create and manage payroll records.',
  },
  {
  name: 'branches.read',
  description: 'View company branches.',
  },
  {
  name: 'branches.manage',
  description: 'Create, update and delete company branches.',
  },

  {
    name: 'invoices.read',
    description: 'View invoices.',
  },
  {
    name: 'invoices.manage',
    description: 'Create and manage invoices.',
  },

  {
    name: 'payments.read',
    description: 'View payments.',
  },
  {
    name: 'payments.manage',
    description: 'Manage payments.',
  },

  {
    name: 'expenses.read',
    description: 'View expenses.',
  },
  {
    name: 'expenses.manage',
    description: 'Create and manage expenses.',
  },

  {
    name: 'inventory.read',
    description: 'View inventory.',
  },
  {
    name: 'inventory.manage',
    description: 'Manage inventory and stock movements.',
  },
  {
  name: 'assets.read',
  description: 'View assets.',
  },
  {
  name: 'assets.manage',
  description: 'Create and manage assets.',
  },

  // SUPPLIERS
  {
    name: 'suppliers.read',
    description: 'View suppliers.',
  },
  {
    name: 'suppliers.manage',
    description: 'Create and manage suppliers.',
  },

  {
    name: 'assets.read',
    description: 'View assets.',
  },
  {
    name: 'assets.manage',
    description: 'Manage assets.',
  },
  {
  name: 'audit.read',
  description: 'View audit logs.',
  },

  {
    name: 'cms.read',
    description: 'View CMS content.',
  },
  {
    name: 'cms.manage',
    description: 'Create and manage CMS content.',
  },
  
  {
    name: 'cms.publish',
    description: 'Publish CMS content.',
  },

  {
    name: 'reports.read',
    description: 'View reports.',
  },
  {
    name: 'reports.export',
    description: 'Export permitted reports.',
  },
  {
  name: 'documents.read',
  description: 'View documents',
  },
  {
  name: 'documents.manage',
  description: 'Create, update, and delete documents',
  },
  {
  name: 'notifications.read',
  description: 'View notifications',
  },
  {
  name: 'notifications.manage',
  description: 'Create, update, and delete notifications',
  },
  {
  name: 'organizations.read',
  description: 'View company organization information.',
 },
 {
  name: 'organizations.manage',
  description: 'Create, update and delete organizations.',
 },
 {
  name: 'divisions.read',
  description: 'View company divisions.',
 },
 {
  name: 'divisions.manage',
  description: 'Create, update and delete company divisions.',
 },
 {
  name: 'leave.read',
  description: 'View employee leave records.',
  },
  {
  name: 'leave.manage',
  description: 'Create, update and delete employee leave records.',
  }, 
  
];

async function main() {
  console.log('🌱 Starting ERP RBAC seed...');

  const organization = await prisma.organization.upsert({
    where: {
      id: 1,
    },
    update: {
      name: 'TechM4India Innovations Pvt. Ltd.',
    },
    create: {
      name: 'TechM4India Innovations Pvt. Ltd.',
      legalName: 'TechM4India Innovations Pvt. Ltd.',
      website: 'https://www.techm4india.com',
    },
  });

  console.log(`🏢 Organization: ${organization.name}`);

  const divisions = [
    'TechM4Schools',
    'TechM4Engineering',
    'TechM4Solutions',
    'TechM4Space Technology',
  ];

  for (const name of divisions) {
    const existing = await prisma.division.findFirst({
      where: {
        name,
        organizationId: organization.id,
      },
    });

    if (!existing) {
      await prisma.division.create({
        data: {
          name,
          organizationId: organization.id,
        },
      });

      console.log(`✅ Created division: ${name}`);
    } else {
      console.log(`ℹ️ Division already exists: ${name}`);
    }
  }

  // Permissions

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        name: permission.name,
      },
      update: {
        description: permission.description,
      },
      create: {
        name: permission.name,
        description: permission.description,
      },
    });
  }

  console.log(`🔑 Permissions ensured: ${permissions.length}`);

  // Roles

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        name: role.name,
      },
      update: {
        description: role.description,
        isActive: true,
      },
      create: {
        name: role.name,
        description: role.description,
      },
    });
  }

  console.log(`👥 Roles ensured: ${roles.length}`);

  // Role → Permission mappings

  const rolePermissions: Record<string, string[]> = {
    SUPER_ADMIN: permissions.map(
      (permission) => permission.name,
    ),

    DIRECTOR: [
      'dashboard.read',
      'audit.read',
      'users.read',
      'roles.read',
      'employees.read',
      'attendance.read',
      'leads.read',
      'institutions.read',
      'programs.read',
      'projects.read',
      'invoices.read',
      'payments.read',
      'expenses.read',
      'inventory.read',
      'assets.read',
      'cms.read',
      'reports.read',
      'reports.export',
      'documents.read',
      'documents.manage',
      'notifications.read',
      'notifications.manage',
      'branches.read',
      'branches.manage',
    ],

    DIVISION_HEAD: [
      'notifications.read',
      'dashboard.read',
      'documents.read',
      'employees.read',
      'departments.read',
      'departments.manage',
      'attendance.read',
      'leads.read',
      'leads.manage',
      'institutions.read',
      'institutions.manage',
      'programs.read',
      'projects.read',
      'projects.manage',
      'reports.read',
      'branches.read',
    ],

    HR_MANAGER: [
      'dashboard.read',
      'employees.read',
      'employees.manage',
      'attendance.read',
      'attendance.manage',
      'reports.read',
    ],

    SALES_MANAGER: [
      'dashboard.read',
      'leads.read',
      'leads.manage',
      'institutions.read',
      'institutions.manage',
      'programs.read',
      'reports.read',
      'reports.export',
      'leads.read',
      'leads.manage',
    ],

    SALES_EXECUTIVE: [
      'dashboard.read',
      'leads.read',
      'leads.manage',
      'institutions.read',
      'institutions.manage',
      'programs.read',
    ],

    FINANCE_MANAGER: [
      'dashboard.read',
      'invoices.read',
      'invoices.manage',
      'payments.read',
      'payments.manage',
      'expenses.read',
      'expenses.manage',
      'reports.read',
      'reports.export',
      'assets.read',
      'assets.manage',
     ],

    PROJECT_MANAGER: [
      'notifications.read',
      'notifications.manage',
      'dashboard.read',
      'projects.read',
      'projects.manage',
      'employees.read',
      'inventory.read',
      'assets.read',
      'reports.read',
      'documents.read',
      'documents.manage',
    ],

    EMPLOYEE: [
      'dashboard.read',
      'employees.read',
      'attendance.read',
      'projects.read',
      'programs.read',
    ],

    CONTENT_MANAGER: [
      'dashboard.read',
      'programs.read',
      'programs.manage',
      'cms.read',
      'cms.manage',
      'cms.publish',
      'documents.read',
      'documents.manage',
      'notifications.read',
      'notifications.manage',
    ],

    VIEWER: [
      'dashboard.read',
      'departments.read',
      'users.read',
      'attendance.read',
      'employees.read',
      'customers.read',
      'leads.read',
      'institutions.read',
      'programs.read',
      'projects.read',
      'invoices.read',
      'payments.read',
      'expenses.read',
      'inventory.read',
      'assets.read',
      'suppliers.read',
      'cms.read',
      'reports.read',
      'sales_orders.read',
      'purchase_orders.read',
      'leads.read',
      'documents.read',
      'notifications.read',
    ],
  };

  for (const [roleName, permissionNames] of Object.entries(
    rolePermissions,
  )) {
    const role = await prisma.role.findUnique({
      where: {
        name: roleName,
      },
    });

    if (!role) {
      throw new Error(`Role not found: ${roleName}`);
    }

    for (const permissionName of permissionNames) {
      const permission =
        await prisma.permission.findUnique({
          where: {
            name: permissionName,
          },
        });

      if (!permission) {
        throw new Error(
          `Permission not found: ${permissionName}`,
        );
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log(
    '🔗 Role-permission mappings ensured successfully!',
  );
    // ------------------------------------------------------------
  // SUPER_ADMIN bootstrap user
  // ------------------------------------------------------------

  const superAdminName = process.env.SUPER_ADMIN_NAME;
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (
    superAdminName &&
    superAdminEmail &&
    superAdminPassword
  ) {
    const hashedPassword = await bcrypt.hash(
      superAdminPassword,
      12,
    );

    const superAdmin = await prisma.user.upsert({
      where: {
        email: superAdminEmail,
      },
      update: {
        name: superAdminName,
        password: hashedPassword,
      },
      create: {
        name: superAdminName,
        email: superAdminEmail,
        password: hashedPassword,
      },
    });

    const superAdminRole = await prisma.role.findUnique({
      where: {
        name: 'SUPER_ADMIN',
      },
    });

    if (!superAdminRole) {
      throw new Error('SUPER_ADMIN role was not found.');
    }

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: superAdmin.id,
          roleId: superAdminRole.id,
        },
      },
      update: {},
      create: {
        userId: superAdmin.id,
        roleId: superAdminRole.id,
      },
    });

    console.log(
      `👑 SUPER_ADMIN bootstrap user ensured: ${superAdmin.email}`,
    );
  } else {
    console.log(
      'ℹ️ SUPER_ADMIN bootstrap skipped: environment variables not configured.',
    );
  }

  console.log('🎉 ERP RBAC seed completed successfully!');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });