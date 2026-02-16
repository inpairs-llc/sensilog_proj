import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RiotService } from '../riot/riot.service';
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

  async login(user: User) {
    const payload = { sub: user.id, gameName: user.gameName };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        riotId: user.riotId,
        gameName: user.gameName,
        tagLine: user.tagLine,
        riotPuuid: user.riotPuuid,
      },
    };
  }

  async riotCallback(code: string) {
    this.logger.debug('Processing Riot OAuth callback');

    const tokenResponse = await this.riotService.exchangeCodeForToken(code);
    const accountInfo = await this.riotService.getAccountInfo(tokenResponse.access_token);

    const riotId = `${accountInfo.gameName}#${accountInfo.tagLine}`;
    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);

    let user = await this.prisma.user.findUnique({
      where: { riotId },
    });

    if (!user) {
      this.logger.debug(`Creating new user: ${riotId}`);
      user = await this.prisma.user.create({
        data: {
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

    return this.login(user);
  }

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

  async ensureValidRiotToken(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('User not found or no refresh token');
    }

    if (user.tokenExpiresAt && user.tokenExpiresAt > new Date()) {
      return user.accessToken!;
    }

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
