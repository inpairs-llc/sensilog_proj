# RSO ログイン ローカル検証手順書

## 前提条件

- Riot Developer Portal で RSO アプリケーションが登録済み
- ngrok の固定 URL が Redirect URI に登録済み
- Docker Desktop が起動している
- pnpm がインストール済み

## 環境変数の設定

### 1. API 環境変数 (`apps/api/.env`)

```env
# Database
DATABASE_URL="postgresql://sensilog_user:sensilog_pass@localhost:5432/sensilog_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Riot OAuth
RIOT_CLIENT_ID="your-riot-client-id"
RIOT_CLIENT_SECRET="your-riot-client-secret"

# Frontend URL (ngrok固定URL)
FRONTEND_URL="https://your-ngrok-url.ngrok-free.dev"

# CORS設定（ngrok + cloudflare tunnel）
CORS_ORIGINS="http://localhost:3000,http://localhost:3002,https://your-ngrok-url.ngrok-free.dev,https://your-cloudflare-tunnel.trycloudflare.com"
```

### 2. Web 環境変数 (`apps/web/.env.local`)

```env
# API URL (Cloudflare Tunnel URL)
NEXT_PUBLIC_API_URL="https://your-cloudflare-tunnel.trycloudflare.com"
```

## サーバー起動手順

### 1. データベース起動

```bash
cd /path/to/sensiLog_monorepo
docker-compose up -d
```

### 2. API サーバー起動（ターミナル1）

```bash
cd apps/api
pnpm dev
```

起動確認: `http://localhost:3001` でAPIが動作

### 3. Cloudflare Tunnel 起動（ターミナル2）

```bash
cloudflared tunnel --url http://localhost:3001
```

表示されるURLをコピーして `apps/web/.env.local` の `NEXT_PUBLIC_API_URL` に設定

> **重要**: Cloudflare Tunnel は動的URLのため、起動の度にURLが変わります。
> 変更した場合は `apps/api/.env` の `CORS_ORIGINS` にも追加して API を再起動してください。

### 4. Web サーバー起動（ターミナル3）

```bash
cd apps/web
rm -rf .next  # ビルドキャッシュをクリア
pnpm dev
```

起動確認: `http://localhost:3000` でWebが動作

### 5. ngrok 起動（ターミナル4）

```bash
ngrok http 3000
```

固定URLが表示されます（例: `https://your-url.ngrok-free.dev`）

## 検証手順

### 1. ログイン前の確認

1. ngrok URL（例: `https://your-url.ngrok-free.dev`）にアクセス
2. ランディングページが表示されることを確認
3. 右上に「Sign in with Riot」ボタンが表示されることを確認
4. `/dashboard` に直接アクセスすると、ランディングページにリダイレクトされることを確認

### 2. ログイン

1. 「Sign in with Riot」ボタンをクリック
2. Riot Games のログインページにリダイレクトされる
3. Riot アカウントでログイン
4. 認可画面で「許可」をクリック
5. `/auth/callback` を経由してダッシュボードにリダイレクトされる

### 3. ログイン後の確認

1. 右上にユーザー名と tagLine（例: `GameName#TAG`）が表示されることを確認
2. ユーザーアイコンをクリックするとドロップダウンメニューが表示される
3. メニュー内容:
   - `GameName#TAG` (ユーザー名)
   - `Riot Account` (アカウント種別)
   - `Account Settings` (設定ページへのリンク)
   - `ログアウト` (ログアウトボタン)
4. 以下のページにアクセスできることを確認:
   - `/dashboard` - ダッシュボード
   - `/settings` - 設定
   - `/matches` - 試合履歴
   - `/analytics` - 分析

### 4. ログアウト

1. 右上のユーザーアイコンをクリック
2. 「ログアウト」をクリック
3. ランディングページにリダイレクトされる
4. 右上に「Sign in with Riot」ボタンが表示される
5. `/dashboard` に直接アクセスすると、ランディングページにリダイレクトされることを確認

## トラブルシューティング

### CORS エラーが発生する場合

1. `apps/api/.env` の `CORS_ORIGINS` に ngrok と Cloudflare Tunnel の URL が両方含まれているか確認
2. API サーバーを再起動

```bash
# APIサーバーのターミナルで Ctrl+C で停止後
cd apps/api
pnpm dev
```

### ユーザー名が `#` だけ表示される場合

- API サーバーを再起動（JWT Strategy の修正が反映されていない可能性）
- ページをリロード

### ログイン後に元のページに戻らない場合

- ブラウザの開発者ツールで sessionStorage に `redirectAfterLogin` が保存されているか確認
- `/auth/callback` ページでエラーが発生していないか確認

### Cloudflare Tunnel の URL が変わった場合

1. 新しい URL を `apps/web/.env.local` に設定
2. `apps/api/.env` の `CORS_ORIGINS` にも追加
3. API サーバーを再起動
4. Web サーバーのビルドキャッシュをクリアして再起動

```bash
rm -rf apps/web/.next
cd apps/web
pnpm dev
```

## 注意事項

- ngrok の無料プランは固定 URL を使用可能（要アカウント登録）
- Cloudflare Tunnel は無料だが動的 URL のため、起動の度に URL が変わる
- 本番環境では固定の公開 URL を使用すること
- JWT_SECRET は本番環境で必ず変更すること
