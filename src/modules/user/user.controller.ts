import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { UsersService } from './user.service';
import { UpdateUserDto } from './dto';
import { UserResponse, UserWithRolesResponse } from './responses';
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
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { RoleService } from '@/modules/role/role.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UsersService,
    private readonly roleService: RoleService,
  ) {}

  // # List Users (Admin only)

  @Get()
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, description: 'Paginated list of users' })
  async getUsers(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<UserResponse>> {
    const paginator = createPaginator();
    const { skip, take, page, limit } = paginator(paginationDto);

    const where = paginationDto.search
      ? {
          OR: [
            { email: { contains: paginationDto.search } },
            { name: { contains: paginationDto.search } },
          ],
        }
      : undefined;

    const [users, total] = await Promise.all([
      this.userService.users({
        skip,
        take,
        where,
        orderBy: paginationDto.sortBy
          ? { [paginationDto.sortBy]: paginationDto.sortOrder }
          : { createdAt: 'desc' },
      }),
      this.userService.count(where),
    ]);

    const userResponses = users.map((user) => UserResponse.fromEntity(user));

    return paginate(userResponses, total, { page, limit });
  }

  // # Get Current User Profile

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserWithRolesResponse })
  async getMe(
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<UserWithRolesResponse> {
    const user = await this.userService.user({ id: currentUser.id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserWithRolesResponse.fromEntityWithRoles(
      user,
      currentUser.roles,
      currentUser.permissions,
    );
  }

  // # Get User by ID

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: UserResponse })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<UserResponse> {
    const user = await this.userService.user({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserResponse.fromEntity(user);
  }

  // # Update User

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, type: UserResponse })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<UserResponse> {
    // Check if user exists
    const existingUser = await this.userService.user({ id });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Only allow updating own profile unless admin
    const isAdmin = currentUser.roles.includes('admin');
    if (currentUser.id !== id && !isAdmin) {
      throw new NotFoundException('User not found');
    }

    // Hash password if provided
    const data: any = { ...updateUserDto };
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.userService.updateUser({
      where: { id },
      data,
    });

    return UserResponse.fromEntity(user);
  }

  // # Delete User (Admin only)

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete user (admin only)' })
  @ApiResponse({ status: 200, type: UserResponse })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponse> {
    const existingUser = await this.userService.user({ id });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const user = await this.userService.deleteUser({ id });

    return UserResponse.fromEntity(user);
  }
}
