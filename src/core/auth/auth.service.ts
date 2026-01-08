import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/modules/user/user.service';
import { LoginDto, RegisterDto } from './dto';
import { AuthUserResponse, TokenResponse } from './responses/auth.response';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<TokenResponse> {
    const { email, password, name } = registerDto;

    // Check if user exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = this.configService.get<number>(
      'auth.bcryptSaltRounds',
      10,
    );
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.usersService.createUser({
      email,
      password: hashedPassword,
      name,
    });

    // Generate tokens
    return this.generateTokens(user.id, user.email, user);
  }

  async login(loginDto: LoginDto): Promise<TokenResponse> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    return this.generateTokens(user.id, user.email, user);
  }

  async refreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<TokenResponse> {
    const user = await this.usersService.user({ id: userId });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    // Validate refresh token
    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Access denied');
    }

    return this.generateTokens(user.id, user.email, user);
  }

  async logout(userId: number): Promise<void> {
    await this.usersService.updateUser({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  private async generateTokens(
    userId: number,
    email: string,
    user: any,
  ): Promise<TokenResponse> {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('auth.jwtSecret'),
      expiresIn: 900, // 15 minutes
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('auth.jwtSecret'),
      expiresIn: 604800, // 7 days
    });

    // Hash and store refresh token
    const saltRounds = this.configService.get<number>(
      'auth.bcryptSaltRounds',
      10,
    );
    const hashedRefreshToken = await bcrypt.hash(refreshToken, saltRounds);
    await this.usersService.updateUser({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });

    return new TokenResponse({
      accessToken,
      refreshToken,
      user: new AuthUserResponse({
        id: user.id,
        email: user.email,
        name: user.name,
      }),
    });
  }
}
