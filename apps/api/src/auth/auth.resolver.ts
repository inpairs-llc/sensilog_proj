import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RiotService } from '../riot/riot.service';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthResponse, RiotAuthUrlResponse } from './dto/auth.response';
import { UserResponse } from './dto/user.response';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private riotService: RiotService,
  ) {}

  @Query(() => RiotAuthUrlResponse)
  riotAuthUrl(): RiotAuthUrlResponse {
    return { authUrl: this.riotService.buildAuthUrl() };
  }

  @Mutation(() => AuthResponse)
  async riotCallback(@Args('code') code: string): Promise<AuthResponse> {
    return this.authService.riotCallback(code);
  }

  @Mutation(() => AuthResponse)
  async refreshToken(@Args('refreshToken') refreshToken: string): Promise<AuthResponse> {
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UserResponse)
  me(@CurrentUser() user: UserResponse): UserResponse {
    return user;
  }
}
