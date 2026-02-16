import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthResponse, RiotAuthUrlResponse } from './dto/auth.response';
import { UserResponse } from './dto/user.response';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Query(() => RiotAuthUrlResponse)
  riotAuthUrl(): RiotAuthUrlResponse {
    const clientId = this.configService.get<string>('RIOT_CLIENT_ID');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const redirectUri = `${frontendUrl}/auth/callback`;

    const riotAuthUrl = new URL('https://auth.riotgames.com/authorize');
    riotAuthUrl.searchParams.append('client_id', clientId!);
    riotAuthUrl.searchParams.append('redirect_uri', redirectUri);
    riotAuthUrl.searchParams.append('response_type', 'code');
    riotAuthUrl.searchParams.append('scope', 'openid');

    return { authUrl: riotAuthUrl.toString() };
  }

  @Mutation(() => AuthResponse)
  async riotCallback(
    @Args('code') code: string,
  ): Promise<AuthResponse> {
    return this.authService.riotCallback(code);
  }

  @Mutation(() => AuthResponse)
  async refreshToken(
    @Args('refreshToken') refreshToken: string,
  ): Promise<AuthResponse> {
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UserResponse)
  me(@CurrentUser() user: UserResponse): UserResponse {
    return user;
  }
}
