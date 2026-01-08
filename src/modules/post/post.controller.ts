import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PostsService } from './post.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { PostResponse } from './responses';
import { PaginationDto } from '@/common/dto/pagination.dto';
import {
  createPaginator,
  paginate,
  PaginatedResult,
} from '@/common/helpers/pagination.helper';
import {
  CurrentUser,
  CurrentUserPayload,
} from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Posts')
@ApiBearerAuth()
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostsService) {}

  // # List Posts (Public - only published)

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all published posts (public)' })
  @ApiResponse({ status: 200, description: 'Paginated list of posts' })
  async getPosts(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<PostResponse>> {
    const paginator = createPaginator();
    const { skip, take, page, limit } = paginator(paginationDto);

    const where = {
      published: true,
      ...(paginationDto.search
        ? {
            OR: [
              { title: { contains: paginationDto.search } },
              { content: { contains: paginationDto.search } },
            ],
          }
        : {}),
    };

    const [posts, total] = await Promise.all([
      this.postService.posts({
        skip,
        take,
        where,
        orderBy: paginationDto.sortBy
          ? { [paginationDto.sortBy]: paginationDto.sortOrder }
          : { id: 'desc' },
      }),
      this.postService.count(where),
    ]);

    const postResponses = posts.map((post) => PostResponse.fromEntity(post));

    return paginate(postResponses, total, { page, limit });
  }

  // # Get My Posts (Authenticated)

  @Get('my')
  @ApiOperation({ summary: 'Get current user posts' })
  @ApiResponse({ status: 200, description: 'Paginated list of user posts' })
  async getMyPosts(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<PaginatedResult<PostResponse>> {
    const paginator = createPaginator();
    const { skip, take, page, limit } = paginator(paginationDto);

    const where = { authorId: currentUser.id };

    const [posts, total] = await Promise.all([
      this.postService.posts({
        skip,
        take,
        where,
        orderBy: { id: 'desc' },
      }),
      this.postService.count(where),
    ]);

    const postResponses = posts.map((post) => PostResponse.fromEntity(post));

    return paginate(postResponses, total, { page, limit });
  }

  // # Get Post by ID (Public for published, owner for drafts)

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiResponse({ status: 200, type: PostResponse })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getPost(@Param('id', ParseIntPipe) id: number): Promise<PostResponse> {
    const post = await this.postService.post({ id });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Only show published posts publicly
    if (!post.published) {
      throw new NotFoundException('Post not found');
    }

    return PostResponse.fromEntity(post);
  }

  // # Create Post (Authenticated)

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, type: PostResponse })
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<PostResponse> {
    const post = await this.postService.createPost({
      ...createPostDto,
      author: {
        connect: { id: currentUser.id },
      },
    });

    return PostResponse.fromEntity(post);
  }

  // # Update Post (Owner only)

  @Put(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiResponse({ status: 200, type: PostResponse })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<PostResponse> {
    const existingPost = await this.postService.post({ id });

    if (!existingPost) {
      throw new NotFoundException('Post not found');
    }

    // Only owner or admin can update
    const isAdmin = currentUser.roles.includes('admin');
    if (existingPost.authorId !== currentUser.id && !isAdmin) {
      throw new ForbiddenException('You can only update your own posts');
    }

    const post = await this.postService.updatePost({
      where: { id },
      data: updatePostDto,
    });

    return PostResponse.fromEntity(post);
  }

  // # Publish Post (Owner only)

  @Put(':id/publish')
  @ApiOperation({ summary: 'Publish a post' })
  @ApiResponse({ status: 200, type: PostResponse })
  async publishPost(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<PostResponse> {
    const existingPost = await this.postService.post({ id });

    if (!existingPost) {
      throw new NotFoundException('Post not found');
    }

    const isAdmin = currentUser.roles.includes('admin');
    if (existingPost.authorId !== currentUser.id && !isAdmin) {
      throw new ForbiddenException('You can only publish your own posts');
    }

    const post = await this.postService.updatePost({
      where: { id },
      data: { published: true },
    });

    return PostResponse.fromEntity(post);
  }

  // # Delete Post (Owner or Admin)

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({ status: 200, type: PostResponse })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async deletePost(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<PostResponse> {
    const existingPost = await this.postService.post({ id });

    if (!existingPost) {
      throw new NotFoundException('Post not found');
    }

    // Only owner or admin can delete
    const isAdmin = currentUser.roles.includes('admin');
    if (existingPost.authorId !== currentUser.id && !isAdmin) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    const post = await this.postService.deletePost({ id });

    return PostResponse.fromEntity(post);
  }
}
