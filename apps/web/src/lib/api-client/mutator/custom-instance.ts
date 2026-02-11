import axios, { AxiosRequestConfig, AxiosError } from 'axios';

// SSR環境かどうかをチェック
const isBrowser = typeof window !== 'undefined';

// 安全なlocalStorageアクセサー
// 特定の環境（プライベートブラウジングなど）でlocalStorageへのアクセスが制限される場合があるため
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (!isBrowser) return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },
  removeItem: (key: string): void => {
    if (!isBrowser) return;
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

const AXIOS_INSTANCE = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// コンテキストに応じてインターセプターを設定
if (isBrowser) {
  // リクエストインターセプター
  AXIOS_INSTANCE.interceptors.request.use(
    (config) => {
      const token = safeLocalStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // レスポンスインターセプター
  AXIOS_INSTANCE.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = safeLocalStorage.getItem('refreshToken');
          if (refreshToken) {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken } = response.data;
            safeLocalStorage.setItem('token', accessToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            return AXIOS_INSTANCE(originalRequest);
          }
        } catch (refreshError) {
          safeLocalStorage.removeItem('token');
          safeLocalStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );
}

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error - Adding cancel method to promise
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

// APIユーティリティ
export const apiUtils = {
  getAuthToken: () => safeLocalStorage.getItem('token'),
  setAuthToken: (token: string) => safeLocalStorage.setItem('token', token),
  removeAuthToken: () => safeLocalStorage.removeItem('token'),

  getRefreshToken: () => safeLocalStorage.getItem('refreshToken'),
  setRefreshToken: (token: string) => safeLocalStorage.setItem('refreshToken', token),
  removeRefreshToken: () => safeLocalStorage.removeItem('refreshToken'),

  clearAuth: () => {
    safeLocalStorage.removeItem('token');
    safeLocalStorage.removeItem('refreshToken');
  },
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
