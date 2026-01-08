import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class PostAuthorResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiPropertyOptional()
  @Expose()
  name?: string;
}

export class PostResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiPropertyOptional()
  @Expose()
  content?: string;

  @ApiProperty()
  @Expose()
  published: boolean;

  @ApiPropertyOptional({ type: PostAuthorResponse })
  @Expose()
  @Type(() => PostAuthorResponse)
  author?: PostAuthorResponse;

  @ApiPropertyOptional()
  @Expose()
  authorId?: number;

  constructor(partial: Partial<PostResponse>) {
    Object.assign(this, partial);
  }

  static fromEntity(post: any): PostResponse {
    const response = new PostResponse({
      id: post.id,
      title: post.title,
      content: post.content,
      published: post.published ?? false,
      authorId: post.authorId,
    });

    if (post.author) {
      response.author = {
        id: post.author.id,
        email: post.author.email,
        name: post.author.name,
      };
    }

    return response;
  }
}
