# SensiLog

VALORANTプレイヤー向けの感度設定管理・パフォーマンス分析アプリケーション。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 15 (App Router), React 19, Tailwind CSS v4 |
| バックエンド | NestJS 10, GraphQL (Apollo Server, code-first) |
| データベース | PostgreSQL, Prisma 7 (PrismaPg ドライバーアダプター) |
| 認証 | Riot OAuth + JWT |
| ビルド | pnpm workspaces |
| デプロイ | Railway (staging / production) |

## 構成

```
apps/
  web/   # Next.js フロントエンド (:3000)
  api/   # NestJS GraphQL API (:3001)
```

## 開発

```bash
pnpm install
pnpm dev              # 全サービス起動
pnpm dev --filter=web # フロントエンドのみ
pnpm dev --filter=api # バックエンドのみ
```

### データベース

```bash
pnpm db:start         # Docker で PostgreSQL 起動
pnpm db:push          # スキーマ変更を DB に反映
pnpm db:studio        # Prisma Studio を開く
pnpm db:migrate       # マイグレーション実行
```

### コード品質

```bash
pnpm lint             # ESLint
pnpm type-check       # TypeScript 型チェック
pnpm format:check     # Prettier チェック
```

## 環境変数

各アプリの README を参照。
