'use client';

import { useState, useEffect, useCallback } from 'react';
import { client } from '@/gql/baseApi';
import { RIOT_AUTH_URL, ME } from '@/gql/index';
import { AuthUser, RiotAuthUrlResponse, MeResponse } from '@/types/auth';

export type { AuthUser } from '@/types/auth';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 初期化: トークンがあればユーザー情報を取得
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      try {
        const data = await client.request<MeResponse>(ME);
        setUser(data.me);
      } catch {
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    init();
  }, []);

  const startRiotLogin = useCallback(async () => {
    try {
      const data = await client.request<RiotAuthUrlResponse>(RIOT_AUTH_URL);
      window.location.href = data.riotAuthUrl.authUrl;
    } catch (err) {
      console.error('Failed to start Riot login:', err);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoggingOut(true);
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsLoggingOut(false);
  }, []);

  const refetch = useCallback(async () => {
    try {
      const data = await client.request<MeResponse>(ME);
      setUser(data.me);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user'));
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading: !isInitialized || isLoading,
    error,

    startRiotLogin,
    logout,
    isLoggingOut,

    refetch,
  };
}
