import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @ApiPropertyOptional({ example: 'Updated Title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated content...' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
