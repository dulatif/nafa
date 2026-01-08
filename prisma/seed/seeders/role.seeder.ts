import { PrismaClient } from '@/generated/prisma/client';

export const roleSeeder = async (prisma: PrismaClient) => {
  console.log('Seeding roles and permissions...');

  // Define permissions
  const permissions = [
    { name: 'create:user', description: 'Create users' },
    { name: 'read:user', description: 'Read users' },
    { name: 'update:user', description: 'Update users' },
    { name: 'delete:user', description: 'Delete users' },
    { name: 'create:post', description: 'Create posts' },
    { name: 'read:post', description: 'Read posts' },
    { name: 'update:post', description: 'Update posts' },
    { name: 'delete:post', description: 'Delete posts' },
  ];

  // Create permissions
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  // Define roles
  const roles = [
    { name: 'admin', description: 'Administrator' },
    { name: 'user', description: 'Regular user' },
  ];

  // Create roles
  for (const roleData of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: roleData,
    });

    // Assign permissions to admin
    if (role.name === 'admin') {
      const allPermissions = await prisma.permission.findMany();
      for (const perm of allPermissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: perm.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: perm.id,
          },
        });
      }
    }

    // Assign basic permissions to user
    if (role.name === 'user') {
      const userPermissions = await prisma.permission.findMany({
        where: {
          name: {
            in: [
              'read:user',
              'create:post',
              'read:post',
              'update:post',
              'delete:post',
            ],
          },
        },
      });
      for (const perm of userPermissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: perm.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: perm.id,
          },
        });
      }
    }
  }

  console.log('Roles and permissions seeded.');
};
