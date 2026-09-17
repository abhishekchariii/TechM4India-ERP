import 'dotenv/config';

import { PrismaClient } from './src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    where: {
      userRoles: {
        some: {
          role: {
            name: 'VIEWER',
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  console.log('VIEWER users:');
  console.log(users);
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });