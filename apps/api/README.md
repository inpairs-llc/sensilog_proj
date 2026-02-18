# SensiLog API

NestJS + GraphQL (Apollo Server, code-first) バックエンド。

## 技術スタック

- **NestJS 10** + TypeScript
- **GraphQL**: `@nestjs/graphql@12` + `@nestjs/apollo@12` + `@apollo/server@4`
- **データベース**: PostgreSQL + Prisma 7 (`@prisma/adapter-pg`)
- **認証**: Riot OAuth + JWT (`@nestjs/passport` + `passport-jwt`)
- **バリデーション**: Joi (起動時の環境変数検証)

## モジュール構成

```
src/
  common/       # ガード (JWT, GQL), デコレーター (@CurrentUser)
  auth/         # 認証リゾルバー, サービス, JWT ストラテジー, DTO
  riot/         # Riot API サービス (OAuth, アカウント情報)
  prisma/       # PrismaService (PrismaPg アダプター)
  app.*         # AppModule, ヘルスチェックエンドポイント
```

## GraphQL エンドポイント

| 種別 | 名前 | 認証 | 説明 |
|------|------|------|------|
| Query | `riotAuthUrl` | 不要 | Riot OAuth URL 取得 |
| Query | `me` | 必要 | 現在のユーザー情報 |
| Mutation | `riotCallback` | 不要 | OAuth コールバック処理 |
| Mutation | `refreshToken` | 不要 | JWT トークンリフレッシュ |

REST は `/health` (GET) のみ。

## 環境変数

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `DATABASE_URL` | はい | PostgreSQL 接続文字列 |
| `JWT_SECRET` | はい | JWT 署名シークレット (32文字以上) |
| `RIOT_CLIENT_ID` | はい | Riot RSO クライアント ID |
| `RIOT_CLIENT_SECRET` | はい | Riot RSO クライアントシークレット |
| `FRONTEND_URL` | はい | フロントエンドの URL |
| `PORT` | いいえ | サーバーポート (デフォルト: 3001) |
| `NODE_ENV` | いいえ | development / staging / production |

## 開発

```bash
pnpm dev              # nest start --watch
pnpm build            # nest build
pnpm type-check       # tsc --noEmit
```

GraphQL Playground: `http://localhost:3001/graphql` (開発環境のみ)

## データベース

```bash
pnpm exec prisma generate        # クライアント生成
pnpm exec prisma db push         # スキーマを DB に反映
pnpm exec prisma studio          # Studio を開く
pnpm exec prisma migrate deploy  # マイグレーション適用
```

## Docker

```bash
docker build -t sensilog-api .
docker run -p 3001:3001 --env-file .env sensilog-api
```
