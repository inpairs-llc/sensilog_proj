# SensiLog Web

Next.js 15 (App Router) + React 19 フロントエンド。

## 技術スタック

- **Next.js 15** (App Router) + React 19 + TypeScript
- **スタイリング**: Tailwind CSS v4
- **状態管理**: RTK Query + `graphql-request`
- **GraphQL コード生成**: `@graphql-codegen/typescript-rtk-query`
- **認証**: Riot OAuth (JWT トークンを localStorage に保存)

## ページ構成

```
src/app/
  page.tsx                    # ランディングページ
  layout.tsx                  # ルートレイアウト
  auth/
    callback/page.tsx         # Riot OAuth コールバック
  (protected)/                # 認証必須 (AuthGuard)
    dashboard/page.tsx        # ダッシュボード
    matches/page.tsx          # 試合履歴
    analytics/page.tsx        # パフォーマンス分析
    settings/page.tsx         # ユーザー設定
  (public)/
    privacy/page.tsx          # プライバシーポリシー
    terms/page.tsx            # 利用規約
```

## 主要ディレクトリ

```
src/
  components/auth/   # AuthGuard, LoginButton
  hooks/useAuth.ts   # 認証フック (ログイン, ログアウト, me クエリ)
  gql/               # GraphQL クライアント, クエリ, コード生成出力
  lib/               # ユーティリティ (フォーマット, VALORANT ヘルパー)
  types/             # 共有型定義
```

## 環境変数

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `NEXT_PUBLIC_API_URL` | はい | バックエンド API の URL (例: `http://localhost:3001`) |

## 開発

```bash
pnpm dev              # next dev (:3000)
pnpm build            # next build
pnpm type-check       # tsc --noEmit
pnpm generate:gql     # GraphQL 型を再生成 (バックエンド起動が必要)
```

## 認証フロー

1. ユーザーがログインボタンをクリック → `useAuth().startRiotLogin()` → Riot OAuth にリダイレクト
2. Riot が `/auth/callback?code=...` にリダイレクト
3. コールバックページが `riotCallback` ミューテーションを実行 → JWT を localStorage に保存
4. `/dashboard` にリダイレクト → `AuthGuard` が `me` クエリで認証を検証
