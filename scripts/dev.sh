#!/usr/bin/env bash
set -e
(
  cd services/api
  pnpm install
  pnpm start:watch
) &
(
  cd apps/web
  pnpm install
  pnpm dev
)
