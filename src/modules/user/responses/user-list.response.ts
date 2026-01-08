import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserResponse } from './user.response';

export class UserListMeta {
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

export class UserListResponse {
  @ApiProperty({ type: [UserResponse] })
  @Expose()
  @Type(() => UserResponse)
  data: UserResponse[];

  @ApiProperty({ type: UserListMeta })
  @Expose()
  @Type(() => UserListMeta)
  meta: UserListMeta;

  constructor(partial: Partial<UserListResponse>) {
    Object.assign(this, partial);
  }
}
