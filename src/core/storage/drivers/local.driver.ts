import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { StorageDriver, UploadedFile } from './storage.driver';

@Injectable()
export class LocalStorageDriver implements StorageDriver {
  private readonly uploadDir = 'uploads';

  constructor(private readonly configService: ConfigService) {}

  async upload(file: UploadedFile): Promise<{ url: string; key: string }> {
    const filename = `${Date.now()}-${file.originalName.replace(/\s+/g, '-')}`;
    const filePath = path.join(process.cwd(), this.uploadDir, filename);

    await fs.promises.writeFile(filePath, file.buffer);

    const appUrl = this.configService.get<string>(
      'app.url',
      'http://localhost:3000',
    );
    const url = `${appUrl}/uploads/${filename}`;

    return { url, key: filename };
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(process.cwd(), this.uploadDir, key);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  getUrl(key: string): string {
    const appUrl = this.configService.get<string>(
      'app.url',
      'http://localhost:3000',
    );
    return `${appUrl}/uploads/${key}`;
  }
}
