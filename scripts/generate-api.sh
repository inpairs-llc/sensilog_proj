#!/bin/bash
set -e

echo "Generating API client from NestJS Swagger..."

# NestJSが起動しているか確認
if ! curl -s http://localhost:3001/docs-json > /dev/null; then
  echo "NestJS API is not running on http://localhost:3001"
  echo "Please start the API with 'pnpm dev:api' first"
  exit 1
fi

# 既存の生成ファイルをクリーンアップ
rm -rf ./apps/web/src/lib/api-client/generated/

# API client生成 (web側のorval.config.tsを使用)
cd apps/web
pnpm orval
cd ../..

# 生成されたファイルのフォーマット
pnpm prettier --write "./apps/web/src/lib/api-client/generated/**/*.{ts,tsx}" || true

echo "API client generated successfully"
