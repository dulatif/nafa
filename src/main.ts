import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Get configuration values
  const port = configService.get<number>('app.port', 3000);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  const corsOrigin = configService.get<string>('app.corsOrigin', '*');

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // Security: Helmet
  app.use(helmet());

  // Performance: Compression
  app.use(compression());

  // CORS
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error for extra properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Convert query params to correct types
      },
    }),
  );

  // Swagger documentation
  const swaggerEnabled = configService.get<boolean>('swagger.enabled', true);
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(
        configService.get<string>('swagger.title', 'NestJS Starter API'),
      )
      .setDescription(
        configService.get<string>('swagger.description', 'API documentation'),
      )
      .setVersion(configService.get<string>('swagger.version', '1.0'))
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    const swaggerPath = configService.get<string>('swagger.path', 'api/docs');
    SwaggerModule.setup(swaggerPath, app, document);

    console.log(
      `📚 Swagger docs available at: http://localhost:${port}/${swaggerPath}`,
    );
  }

  await app.listen(port);
  console.log(
    `🚀 Application is running on: http://localhost:${port}/${apiPrefix}`,
  );
}

bootstrap();
