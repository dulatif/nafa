import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

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

// Feature modules
import { UserModule } from '@/modules/user/user.module';
import { PostModule } from '@/modules/post/post.module';

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

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Database
    PrismaModule,

    // Feature modules
    UserModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
