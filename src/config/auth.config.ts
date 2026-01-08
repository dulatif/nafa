import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret:
    process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
}));
