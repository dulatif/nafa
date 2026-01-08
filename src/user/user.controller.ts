import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './user.service';
import { User as UserModel } from '@/generated/prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async signupUser(
    @Body() userData: { name?: string; email: string },
  ): Promise<UserModel> {
    return this.userService.createUser(userData);
  }
}
