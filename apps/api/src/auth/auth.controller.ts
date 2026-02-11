import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Redirect,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  /**
   * Riot OAuth認証URLを取得してリダイレクト
   */
  @Get('riot/login')
  @Redirect()
  riotLogin() {
    const clientId = this.configService.get<string>('RIOT_CLIENT_ID');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const redirectUri = `${frontendUrl}/auth/callback`;

    const riotAuthUrl = new URL('https://auth.riotgames.com/authorize');
    riotAuthUrl.searchParams.append('client_id', clientId!);
    riotAuthUrl.searchParams.append('redirect_uri', redirectUri);
    riotAuthUrl.searchParams.append('response_type', 'code');
    riotAuthUrl.searchParams.append('scope', 'openid');

    return { url: riotAuthUrl.toString() };
  }

  /**
   * Riot OAuth認証URLを返す（リダイレクトなし）
   */
  @Get('riot/auth-url')
  getRiotAuthUrl() {
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

  /**
   * Riot OAuth callbackを処理
   * フロントエンドからcodeを受け取り、tokenを交換
   */
  @Post('riot/callback')
  async riotCallback(@Body() body: { code: string }) {
    if (!body.code) {
      throw new UnauthorizedException('Authorization code is required');
    }
    return this.authService.riotCallback(body.code);
  }

  /**
   * 現在のユーザー情報を取得
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: any) {
    return req.user;
  }

  /**
   * JWTトークンをリフレッシュ
   */
  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  /**
   * JWTトークンを検証
   */
  @Post('validate')
  async validateToken(@Body() body: { token: string }) {
    const user = await this.authService.validateToken(body.token);
    return { valid: true, user };
  }

  /**
   * ログアウト
   */
  @Post('logout')
  async logout() {
    return { message: 'Logged out successfully' };
  }
}
