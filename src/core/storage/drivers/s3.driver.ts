import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { StorageDriver, UploadedFile } from './storage.driver';

@Injectable()
export class S3StorageDriver implements StorageDriver {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('storage.s3Bucket')!;
    this.region = this.configService.get<string>('storage.s3Region')!;
    this.endpoint = this.configService.get<string>('storage.s3Endpoint')!;

    this.client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.configService.get<string>('storage.s3AccessKey')!,
        secretAccessKey: this.configService.get<string>('storage.s3SecretKey')!,
      },
      forcePathStyle: true, // Needed for MinIO/DigitalOcean Spaces
    });
  }

  async upload(file: UploadedFile): Promise<{ url: string; key: string }> {
    const key = `${Date.now()}-${file.originalName.replace(/\s+/g, '-')}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimeType,
        ACL: 'public-read',
      }),
    );

    const url = this.getUrl(key);
    return { url, key };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  getUrl(key: string): string {
    // Custom logic to handle different S3 provider URL formats if needed
    if (this.endpoint) {
      // S3 compatible services (MinIO, etc.)
      return `${this.endpoint}/${this.bucket}/${key}`;
    }
    // Standard AWS S3
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
