import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

// Configuration
import {
  appConfig,
  authConfig,
  databaseConfig,
  storageConfig,
  swaggerConfig,
} from '@/config';

// Core modules
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@/core/auth/auth.module';
import { StorageModule } from '@/core/storage/storage.module';
import { HealthModule } from '@/core/health/health.module';

// Feature modules
import { UserModule } from '@/modules/user/user.module';
import { PostModule } from '@/modules/post/post.module';

// Guards
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

// App
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        authConfig,
        databaseConfig,
        storageConfig,
        swaggerConfig,
      ],
    }),

    // Static file serving for uploads
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Database
    PrismaModule,

    // Core modules
    AuthModule,
    StorageModule,
    HealthModule,

    // Feature modules
    UserModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply JwtAuthGuard globally
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
