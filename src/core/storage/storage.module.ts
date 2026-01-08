import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { LocalStorageDriver } from './drivers/local.driver';
import { S3StorageDriver } from './drivers/s3.driver';

@Module({
  controllers: [StorageController],
  providers: [StorageService, LocalStorageDriver, S3StorageDriver],
  exports: [StorageService],
})
export class StorageModule {}
