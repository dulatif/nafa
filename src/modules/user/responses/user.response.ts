import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

export class UserResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiPropertyOptional()
  @Expose()
  name?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @Exclude()
  password: string;

  @Exclude()
  refreshToken: string;

  constructor(partial: Partial<UserResponse>) {
    Object.assign(this, partial);
  }

  static fromEntity(user: any): UserResponse {
    return new UserResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}

export class UserWithRolesResponse extends UserResponse {
  @ApiProperty({ type: [String] })
  @Expose()
  roles: string[];

  @ApiProperty({ type: [String] })
  @Expose()
  permissions: string[];

  constructor(partial: Partial<UserWithRolesResponse>) {
    super(partial);
    this.roles = partial.roles || [];
    this.permissions = partial.permissions || [];
  }

  static fromEntityWithRoles(
    user: any,
    roles: string[],
    permissions: string[],
  ): UserWithRolesResponse {
    return new UserWithRolesResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles,
      permissions,
    });
  }
}
