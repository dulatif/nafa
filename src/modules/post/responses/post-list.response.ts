import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PostResponse } from './post.response';

export class PostListMeta {
  @ApiProperty()
  @Expose()
  total: number;

  @ApiProperty()
  @Expose()
  lastPage: number;

  @ApiProperty()
  @Expose()
  currentPage: number;

  @ApiProperty()
  @Expose()
  perPage: number;

  @ApiProperty({ nullable: true })
  @Expose()
  prev: number | null;

  @ApiProperty({ nullable: true })
  @Expose()
  next: number | null;
}

export class PostListResponse {
  @ApiProperty({ type: [PostResponse] })
  @Expose()
  @Type(() => PostResponse)
  data: PostResponse[];

  @ApiProperty({ type: PostListMeta })
  @Expose()
  @Type(() => PostListMeta)
  meta: PostListMeta;

  constructor(partial: Partial<PostListResponse>) {
    Object.assign(this, partial);
  }
}
