import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class FileResponse {
  @ApiProperty()
  @Expose()
  filename: string;

  @ApiProperty()
  @Expose()
  originalName: string;

  @ApiProperty()
  @Expose()
  mimeType: string;

  @ApiProperty()
  @Expose()
  size: number;

  @ApiProperty()
  @Expose()
  url: string;

  constructor(partial: Partial<FileResponse>) {
    Object.assign(this, partial);
  }
}
