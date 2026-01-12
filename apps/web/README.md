# dHEDGE Web (Polygon)

Metalos-inspired Next.js UI for dHEDGE V2 pools on Polygon. Calls the local Express API in `services/api`.

## Quickstart

```bash
cd apps/web
pnpm install
pnpm dev
```

Set env:
```
cp .env.example .env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_POLYGON_RPC=... # your RPC
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=... # walletconnect project id
```

## Features
- Wallet connect (wagmi + walletConnect) preloaded with Polygon.
- Pool list (config-driven) with composition fetch.
- Create pool wizard (calls `/createPool`).
- Deposit (approve+deposit) and Trade (approve+trade) actions.
- Non-custodial withdraw to be added via wagmi write.

## Notes
- Pool list is seeded from `config/polygon.ts`. Replace with factory query or subgraph later.
- Prices/TVL currently not shown; composition is fetched on demand.

## Deployment (Vercel)
- `vercel.json` at repo root points to build from `apps/web`.
- Ensure env vars set in Vercel: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_POLYGON_RPC`, `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.
