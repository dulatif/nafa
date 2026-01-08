import { registerAs } from '@nestjs/config';

export default registerAs('swagger', () => ({
  title: process.env.SWAGGER_TITLE || 'NestJS Starter API',
  description:
    process.env.SWAGGER_DESCRIPTION ||
    'API documentation for NestJS Starter Kit',
  version: process.env.SWAGGER_VERSION || '1.0',
  path: process.env.SWAGGER_PATH || 'api/docs',
  enabled: process.env.SWAGGER_ENABLED !== 'false', // Enabled by default
}));
