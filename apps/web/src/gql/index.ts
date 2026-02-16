import { gql } from 'graphql-request';

export const RIOT_AUTH_URL = gql`
  query RiotAuthUrl {
    riotAuthUrl {
      authUrl
    }
  }
`;

export const RIOT_CALLBACK = gql`
  mutation RiotCallback($code: String!) {
    riotCallback(code: $code) {
      accessToken
      user {
        id
        gameName
        tagLine
      }
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      user {
        id
        gameName
        tagLine
      }
    }
  }
`;

export const ME = gql`
  query Me {
    me {
      id
      riotId
      gameName
      tagLine
      riotPuuid
    }
  }
`;
