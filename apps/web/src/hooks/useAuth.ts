'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  apiUtils,
  postAuthRiotCallback,
  getAuthMe,
  getAuthRiotLogin,
} from '@sensilog/api-client';
import { useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  gameName?: string;
  tagLine?: string;
  riotPuuid?: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

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

      return await getAuthMe();
    },
    enabled: !!apiUtils.getAuthToken(),
    retry: false,
    staleTime: 30 * 60 * 1000, // 30分
  });

  // ログイン処理
  const loginMutation = useMutation({
    mutationFn: async (credentials: { code: string; state?: string }) => {
      return await postAuthRiotCallback(credentials);
    },
    onSuccess: (data) => {
      // ユーザー情報をキャッシュに設定
      queryClient.setQueryData(['auth', 'me'], data.user);
      // 他のクエリを無効化
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['match-data'] });
    },
  });

  // ログアウト処理
  const logoutMutation = useMutation({
    mutationFn: async () => {
      apiUtils.removeAuthToken();
    },
    onSuccess: () => {
      // 全てのクエリキャッシュをクリア
      queryClient.clear();
    },
  });

  // トークンリフレッシュ
  const refreshMutation = useMutation({
    mutationFn: async () => {
      return await apiUtils.refreshToken();
    },
    onSuccess: (success) => {
      if (success) {
        refetch();
      } else {
        logoutMutation.mutate();
      }
    },
  });

  // 初期化処理
  useEffect(() => {
    const token = apiUtils.getAuthToken();
    if (token && !user && !isLoading) {
      refetch();
    }
    setIsInitialized(true);
  }, [user, isLoading, refetch]);

  // Riot OAuth認証URL取得
  const getRiotAuthUrl = async (): Promise<{
    authUrl: string;
    state: string;
  }> => {
    return await getAuthRiotLogin();
  };

  return {
    // 状態
    user,
    isAuthenticated: !!user,
    isLoading: !isInitialized || isLoading,
    error,

    // アクション
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    refresh: refreshMutation.mutate,
    getRiotAuthUrl,

    // ローディング状態
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRefreshing: refreshMutation.isPending,

    // エラー
    loginError: loginMutation.error as Error | null,
    logoutError: logoutMutation.error as Error | null,
    refreshError: refreshMutation.error as Error | null,

    // リセット
    resetLoginError: loginMutation.reset,
  };
}
