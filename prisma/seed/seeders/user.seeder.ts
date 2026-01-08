import { PrismaClient } from '@/generated/prisma/client';
import { createUserFactory } from '../factories/user.factory';
import * as bcrypt from 'bcrypt';

export const userSeeder = async (prisma: PrismaClient) => {
  console.log('Seeding users...');

  // Get roles
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  const userRole = await prisma.role.findUnique({ where: { name: 'user' } });

  if (!adminRole || !userRole) {
    throw new Error('Roles not found. Run role seeder first.');
  }

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminEmail = 'admin@example.com';

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Super Admin',
      password: adminPassword,
    },
  });

  // Assign admin role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id,
    },
  });

  // Create Sample Users
  const userPromises = Array.from({ length: 5 }).map(async () => {
    const userData = await createUserFactory();
    const user = await prisma.user.create({ data: userData });

    // Assign user role
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: userRole.id,
      },
    });

    return user;
  });

  await Promise.all(userPromises);

  console.log('Users seeded.');
};
