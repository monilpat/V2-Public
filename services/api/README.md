# dHEDGE V2 SDK API (Polygon default)

Express API wrapping `@dhedge/v2-sdk` for pool creation, composition, asset changes, deposits, and trades.

## Quickstart

```bash
cp .env.example .env
# fill PRIVATE_KEY, INFURA_PROJECT_ID, ONEINCH_API_KEY
pnpm install
pnpm start:watch
```

- Default network: Polygon mainnet. Enable overrides with `ENABLE_NETWORK_OVERRIDE=true` and pass `?network=optimism|arbitrum`.
- Key routes:
  - `PUT /createPool`
  - `GET /poolComposition?pool=`
  - `POST /changeAssets?pool=`
  - `POST /setTrader?pool=`
  - `POST /approveDeposit?pool=`
  - `POST /deposit?pool=`
  - `POST /approve?pool=&platform=oneinch|uniswapV3`
  - `GET /trade?pool=&from=&to=&share=50&slippage=0.5`

## Env vars
- `PRIVATE_KEY` — signer for manager/trader actions
- `INFURA_PROJECT_ID` — Polygon/Optimism/Arbitrum RPC
- `ONEINCH_API_KEY` — for 1inch trades
- `ENABLE_NETWORK_OVERRIDE` — set `true` to allow `?network=` query (default false)
- `PORT` — defaults to 8000
