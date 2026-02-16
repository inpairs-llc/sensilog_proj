export interface AuthUser {
  id: string;
  riotId?: string;
  gameName: string;
  tagLine: string;
  riotPuuid?: string | null;
}

export interface RiotAuthUrlResponse {
  riotAuthUrl: { authUrl: string };
}

export interface MeResponse {
  me: AuthUser;
}
