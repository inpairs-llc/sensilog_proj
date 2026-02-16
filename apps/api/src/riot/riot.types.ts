export interface RiotTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  id_token?: string;
}

export interface RiotAccountInfo {
  puuid: string;
  gameName: string;
  tagLine: string;
}
