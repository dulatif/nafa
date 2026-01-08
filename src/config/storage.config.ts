import { registerAs } from '@nestjs/config';

export type StorageDriver = 'local' | 's3';

export default registerAs('storage', () => ({
  driver: (process.env.STORAGE_DRIVER || 'local') as StorageDriver,

  // Local storage settings
  local: {
    uploadPath: process.env.STORAGE_LOCAL_PATH || './uploads',
    serveRoot: process.env.STORAGE_SERVE_ROOT || '/uploads',
  },

  // S3 storage settings (for future use)
  s3: {
    bucket: process.env.AWS_S3_BUCKET || '',
    region: process.env.AWS_S3_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    endpoint: process.env.AWS_S3_ENDPOINT || undefined, // For S3-compatible services
  },

  // File upload limits
  maxFileSize: parseInt(process.env.STORAGE_MAX_FILE_SIZE || '10485760', 10), // 10MB default
  allowedMimeTypes: (
    process.env.STORAGE_ALLOWED_TYPES ||
    'image/jpeg,image/png,image/gif,image/webp,application/pdf'
  ).split(','),
}));
