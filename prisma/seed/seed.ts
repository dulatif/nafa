import { PrismaClient } from '@/generated/prisma/client';
import { roleSeeder } from './seeders/role.seeder';
import { userSeeder } from './seeders/user.seeder';
import { postSeeder } from './seeders/post.seeder';

import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding ...');

  await roleSeeder(prisma);
  await userSeeder(prisma);
  await postSeeder(prisma);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
