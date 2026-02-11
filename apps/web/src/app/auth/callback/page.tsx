'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiUtils } from '@/lib/api-client/mutator/custom-instance';

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

      // エラーがある場合
      if (error) {
        setStatus('error');
        setErrorMessage(errorDescription || error || '認証に失敗しました');
        return;
      }

      // codeがない場合
      if (!code) {
        setStatus('error');
        setErrorMessage('認証コードが見つかりません');
        return;
      }

      try {
        // バックエンドにcodeを送信してtokenを取得
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/auth/riot/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || '認証に失敗しました');
        }

        const data = await response.json();

        // トークンを保存
        if (data.accessToken) {
          apiUtils.setAuthToken(data.accessToken);
        }

        setStatus('success');

        // 保存されたリダイレクト先、またはダッシュボードにリダイレクト
        setTimeout(() => {
          const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
          sessionStorage.removeItem('redirectAfterLogin');
          router.push(redirectUrl);
        }, 1000);
      } catch (err) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : '認証処理中にエラーが発生しました');
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
            <div className="text-green-500 text-5xl">✓</div>
            <p className="text-white text-lg">認証成功！</p>
            <p className="text-gray-400">ダッシュボードにリダイレクトしています...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="text-red-500 text-5xl">✕</div>
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
