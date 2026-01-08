import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './user.service';
import { User as UserModel } from '@/generated/prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async getUsers(): Promise<UserModel[]> {
    return this.userService.users({});
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserModel | null> {
    return this.userService.user({ id });
  }
}
