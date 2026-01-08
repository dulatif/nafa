import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Role, Permission, Prisma } from '@/generated/prisma/client';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  // # Role Methods

  async findAllRoles(): Promise<Role[]> {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async findRoleById(id: number): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async findRoleByName(name: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { name },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async createRole(data: Prisma.RoleCreateInput): Promise<Role> {
    return this.prisma.role.create({
      data,
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async updateRole(id: number, data: Prisma.RoleUpdateInput): Promise<Role> {
    return this.prisma.role.update({
      where: { id },
      data,
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async deleteRole(id: number): Promise<Role> {
    return this.prisma.role.delete({
      where: { id },
    });
  }

  // # Permission Methods

  async findAllPermissions(): Promise<Permission[]> {
    return this.prisma.permission.findMany();
  }

  async findPermissionById(id: number): Promise<Permission | null> {
    return this.prisma.permission.findUnique({
      where: { id },
    });
  }

  async findPermissionByName(name: string): Promise<Permission | null> {
    return this.prisma.permission.findUnique({
      where: { name },
    });
  }

  async createPermission(
    data: Prisma.PermissionCreateInput,
  ): Promise<Permission> {
    return this.prisma.permission.create({
      data,
    });
  }

  async deletePermission(id: number): Promise<Permission> {
    return this.prisma.permission.delete({
      where: { id },
    });
  }

  // # Role-Permission Assignment

  async assignPermissionToRole(
    roleId: number,
    permissionId: number,
  ): Promise<void> {
    await this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }

  async removePermissionFromRole(
    roleId: number,
    permissionId: number,
  ): Promise<void> {
    await this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
  }

  // # User-Role Assignment

  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    await this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    await this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });
  }

  async getUserRolesAndPermissions(userId: number): Promise<{
    roles: string[];
    permissions: string[];
  }> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const roles = userRoles.map((ur) => ur.role.name);
    const permissionsSet = new Set<string>();

    userRoles.forEach((ur) => {
      ur.role.permissions.forEach((rp) => {
        permissionsSet.add(rp.permission.name);
      });
    });

    return {
      roles,
      permissions: Array.from(permissionsSet),
    };
  }
}
