import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RiotService } from './riot.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private riotService: RiotService,
  ) {}

  /**
   * JWTトークンを発行
   */
  async login(user: User) {
    const payload = { email: user.email, sub: user.id, isAdmin: user.isAdmin };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        gameName: user.gameName,
        tagLine: user.tagLine,
        riotPuuid: user.riotPuuid,
        isAdmin: user.isAdmin,
      },
    };
  }

  /**
   * Riot OAuth callbackを処理
   * codeからtokenを取得し、ユーザー情報を取得・保存
   */
  async riotCallback(code: string) {
    this.logger.debug('Processing Riot OAuth callback');

    // 1. codeをaccess_tokenに交換
    const tokenResponse = await this.riotService.exchangeCodeForToken(code);

    // 2. access_tokenを使ってユーザー情報を取得
    const accountInfo = await this.riotService.getAccountInfo(tokenResponse.access_token);

    // 3. ユーザーを作成または更新
    const riotId = `${accountInfo.gameName}#${accountInfo.tagLine}`;
    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);

    let user = await this.prisma.user.findUnique({
      where: { riotId },
    });

    if (!user) {
      this.logger.debug(`Creating new user: ${riotId}`);
      user = await this.prisma.user.create({
        data: {
          email: `${accountInfo.gameName.toLowerCase().replace(/\s/g, '_')}@riot.local`,
          riotId,
          gameName: accountInfo.gameName,
          tagLine: accountInfo.tagLine,
          riotPuuid: accountInfo.puuid,
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          tokenExpiresAt: expiresAt,
        },
      });
    } else {
      this.logger.debug(`Updating existing user: ${riotId}`);
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          tokenExpiresAt: expiresAt,
          riotPuuid: accountInfo.puuid,
        },
      });
    }

    // 4. JWTトークンを発行して返す
    return this.login(user);
  }

  /**
   * 既存のriotAuthメソッド（後方互換性のため維持）
   */
  async riotAuth(riotAuthData: any) {
    const { puuid, gameName, tagLine, accessToken, refreshToken, expiresAt } = riotAuthData;

    const riotId = `${gameName}#${tagLine}`;

    let user = await this.prisma.user.findUnique({
      where: { riotId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: `${gameName.toLowerCase()}@riot.local`,
          riotId,
          gameName,
          tagLine,
          riotPuuid: puuid,
          accessToken,
          refreshToken,
          tokenExpiresAt: new Date(expiresAt),
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          accessToken,
          refreshToken,
          tokenExpiresAt: new Date(expiresAt),
          riotPuuid: puuid,
        },
      });
    }

    return this.login(user);
  }

  /**
   * JWTトークンを検証
   */
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException();
      }
      return user;
    } catch {
      throw new UnauthorizedException();
    }
  }

  /**
   * JWTリフレッシュトークンを処理
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        ignoreExpiration: true,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      return this.login(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * ユーザーのRiot access_tokenが期限切れの場合は更新
   */
  async ensureValidRiotToken(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('User not found or no refresh token');
    }

    // トークンがまだ有効な場合はそのまま返す
    if (user.tokenExpiresAt && user.tokenExpiresAt > new Date()) {
      return user.accessToken!;
    }

    // トークンを更新
    this.logger.debug(`Refreshing Riot token for user: ${user.id}`);
    const tokenResponse = await this.riotService.refreshAccessToken(user.refreshToken);
    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        tokenExpiresAt: expiresAt,
      },
    });

    return tokenResponse.access_token;
  }
}
