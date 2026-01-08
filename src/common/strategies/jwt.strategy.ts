import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RoleService } from '@/modules/role/role.service';

export interface JwtPayload {
  sub: number;
  email: string;
  iat?: number;
  exp?: number;
}

export interface JwtUser {
  id: number;
  email: string;
  roles: string[];
  permissions: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private roleService: RoleService,
  ) {
    const jwtSecret = configService.get<string>('auth.jwtSecret');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtUser> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Fetch user roles and permissions
    const { roles, permissions } =
      await this.roleService.getUserRolesAndPermissions(payload.sub);

    return {
      id: payload.sub,
      email: payload.email,
      roles,
      permissions,
    };
  }
}
