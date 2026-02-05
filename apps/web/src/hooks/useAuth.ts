'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiUtils } from '@/lib/api-client/mutator/custom-instance';
import { useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  gameName?: string;
  tagLine?: string;
  riotPuuid?: string;
  isAdmin: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useAuth() {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // クライアントサイドでのみトークンをチェック
  useEffect(() => {
    const token = apiUtils.getAuthToken();
    setHasToken(!!token);
    setIsInitialized(true);
  }, []);

  // 認証状態の確認
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async (): Promise<AuthUser> => {
      const token = apiUtils.getAuthToken();
      if (!token) {
        throw new Error('No auth token');
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      return response.json();
    },
    enabled: isInitialized && hasToken,
    retry: false,
    staleTime: 30 * 60 * 1000, // 30分
  });

  // Riot OAuth認証URLへリダイレクト
  const startRiotLogin = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/auth/riot/auth-url`);
      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Failed to start Riot login:', error);
      throw error;
    }
  }, []);

  // ログアウト処理
  const logoutMutation = useMutation({
    mutationFn: async () => {
      apiUtils.clearAuth();
      setHasToken(false);
    },
    onSuccess: () => {
      // 全てのクエリキャッシュをクリア
      queryClient.clear();
    },
  });

  // トークンリフレッシュ
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = apiUtils.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data: AuthResponse = await response.json();
      apiUtils.setAuthToken(data.accessToken);
      setHasToken(true);
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(['auth', 'me'], data.user);
        refetch();
      }
    },
    onError: () => {
      logoutMutation.mutate();
    },
  });

  return {
    // 状態
    user,
    isAuthenticated: !!user,
    isLoading: !isInitialized || (hasToken && isLoading),
    error,

    // アクション
    startRiotLogin,
    logout: logoutMutation.mutate,
    refresh: refreshMutation.mutate,

    // ローディング状態
    isLoggingOut: logoutMutation.isPending,
    isRefreshing: refreshMutation.isPending,

    // エラー
    logoutError: logoutMutation.error as Error | null,
    refreshError: refreshMutation.error as Error | null,

    // リセット
    refetch,
  };
}
