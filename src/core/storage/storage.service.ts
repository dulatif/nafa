import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageDriver, UploadedFile } from './drivers/storage.driver';
import { LocalStorageDriver } from './drivers/local.driver';
import { S3StorageDriver } from './drivers/s3.driver';
import { FileResponse } from './responses/file.response';

@Injectable()
export class StorageService {
  private driver: StorageDriver;

  constructor(
    private readonly configService: ConfigService,
    private readonly localDriver: LocalStorageDriver,
    private readonly s3Driver: S3StorageDriver,
  ) {
    const driverType = this.configService.get<string>(
      'storage.driver',
      'local',
    );

    if (driverType === 's3') {
      this.driver = this.s3Driver;
    } else {
      this.driver = this.localDriver;
    }
  }

  async upload(file: Express.Multer.File): Promise<FileResponse> {
    const uploadedFile: UploadedFile = {
      filename: file.filename || file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    };

    const { url, key } = await this.driver.upload(uploadedFile);

    return new FileResponse({
      filename: key,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url,
    });
  }

  async delete(filename: string): Promise<void> {
    await this.driver.delete(filename);
  }
}
