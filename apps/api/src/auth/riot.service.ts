import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

interface RiotTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  id_token?: string;
}

interface RiotAccountInfo {
  puuid: string;
  gameName: string;
  tagLine: string;
}

@Injectable()
export class RiotService {
  private readonly logger = new Logger(RiotService.name);
  private readonly tokenUrl = 'https://auth.riotgames.com/token';
  private readonly accountUrl = 'https://americas.api.riotgames.com/riot/account/v1/accounts/me';

  constructor(private configService: ConfigService) {}

  /**
   * OAuth authorization codeをaccess_tokenに交換
   */
  async exchangeCodeForToken(code: string): Promise<RiotTokenResponse> {
    const clientId = this.configService.get<string>('RIOT_CLIENT_ID');
    const clientSecret = this.configService.get<string>('RIOT_CLIENT_SECRET');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const redirectUri = `${frontendUrl}/auth/callback`;

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Riot OAuth credentials not configured');
    }

    try {
      this.logger.debug(`Exchanging code for token with redirect_uri: ${redirectUri}`);

      const response = await axios.post<RiotTokenResponse>(
        this.tokenUrl,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.logger.debug('Successfully exchanged code for token');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error('Failed to exchange code for token', {
          status: error.response?.status,
          data: error.response?.data,
        });
        throw new UnauthorizedException('Failed to authenticate with Riot Games');
      }
      throw error;
    }
  }

  /**
   * Riot Account APIからユーザー情報を取得
   */
  async getAccountInfo(accessToken: string): Promise<RiotAccountInfo> {
    try {
      this.logger.debug('Fetching account info from Riot API');

      const response = await axios.get<RiotAccountInfo>(this.accountUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Charset': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
      });

      this.logger.debug(
        `Successfully fetched account info for ${response.data.gameName}#${response.data.tagLine}`,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error('Failed to fetch account info', {
          status: error.response?.status,
          data: error.response?.data,
        });
        throw new UnauthorizedException('Failed to fetch account information from Riot Games');
      }
      throw error;
    }
  }

  /**
   * Refresh tokenを使って新しいaccess_tokenを取得
   */
  async refreshAccessToken(refreshToken: string): Promise<RiotTokenResponse> {
    const clientId = this.configService.get<string>('RIOT_CLIENT_ID');
    const clientSecret = this.configService.get<string>('RIOT_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Riot OAuth credentials not configured');
    }

    try {
      this.logger.debug('Refreshing access token');

      const response = await axios.post<RiotTokenResponse>(
        this.tokenUrl,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.logger.debug('Successfully refreshed access token');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error('Failed to refresh access token', {
          status: error.response?.status,
          data: error.response?.data,
        });
        throw new UnauthorizedException('Failed to refresh Riot authentication');
      }
      throw error;
    }
  }
}
