import 'dotenv/config';
import * as bcrypt from 'bcrypt';

import { PrismaClient } from './src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const password = 'ViewerTest@123';
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: {
      id: 24,
    },
    data: {
      password: hashedPassword,
    },
  });

  console.log('✅ VIEWER test password reset successfully.');
}

main()
  .catch((error) => {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });