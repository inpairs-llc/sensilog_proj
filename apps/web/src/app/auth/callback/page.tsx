'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { client } from '@/gql/baseApi';
import { RIOT_CALLBACK } from '@/gql/index';

interface RiotCallbackResponse {
  riotCallback: {
    accessToken: string;
    user: {
      id: string;
      gameName: string;
      tagLine: string;
    };
  };
}

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        setStatus('error');
        setErrorMessage(errorDescription || error || '認証に失敗しました');
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('認証コードが見つかりません');
        return;
      }

      try {
        const data = await client.request<RiotCallbackResponse>(RIOT_CALLBACK, { code });

        if (data.riotCallback.accessToken) {
          localStorage.setItem('auth_token', data.riotCallback.accessToken);
        }

        setStatus('success');

        setTimeout(() => {
          const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
          sessionStorage.removeItem('redirectAfterLogin');
          router.push(redirectUrl);
        }, 1000);
      } catch {
        setStatus('error');
        setErrorMessage(
          '認証処理中にエラーが発生しました。しばらくしてからもう一度お試しください。',
        );
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white text-lg">Riot Gamesアカウントで認証中...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="text-green-500 text-5xl">&#x2713;</div>
            <p className="text-white text-lg">認証成功！</p>
            <p className="text-gray-400">ダッシュボードにリダイレクトしています...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="text-red-500 text-5xl">&#x2715;</div>
            <p className="text-white text-lg">認証に失敗しました</p>
            <p className="text-gray-400">{errorMessage}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ホームに戻る
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
