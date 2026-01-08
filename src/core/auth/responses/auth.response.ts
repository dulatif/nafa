import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class AuthUserResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty({ required: false })
  @Expose()
  name?: string;

  @Exclude()
  password: string;

  @Exclude()
  refreshToken: string;

  constructor(partial: Partial<AuthUserResponse>) {
    Object.assign(this, partial);
  }
}

export class TokenResponse {
  @ApiProperty()
  @Expose()
  accessToken: string;

  @ApiProperty()
  @Expose()
  refreshToken: string;

  @ApiProperty({ type: AuthUserResponse })
  @Expose()
  user: AuthUserResponse;

  constructor(partial: Partial<TokenResponse>) {
    Object.assign(this, partial);
  }
}
