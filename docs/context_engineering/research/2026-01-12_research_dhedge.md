# Research: Reproducing dhedge.org (V2-Public vs dhedge-v2-sdk-examples)

Date: 2026-01-12 08:45:46 PST
Repositories: V2-Public (branch master), dhedge-v2-sdk-examples (branch master)

## Research Question
Understand how the V2-Public contracts and the dhedge-v2-sdk-examples server work, and decide which repo(s) to base an app on that reproduces dhedge.org vault creation, management, and trading.

## Key Findings
1) Core pool lifecycle lives in V2-Public contracts
   - PoolFactoryV24 initializes fee/asset limits and deploys new pool + manager proxy instances via `createFund`, enforcing max supported assets and fee caps. (contracts/v2.4.1/PoolFactoryV24.sol:129-209)
   - PoolLogicV24 is the ERC20 share token; `initialize` stores factory/privacy and sets initial price; `deposit` mints shares against USD value of allowed assets; `withdraw` burns shares and returns each supported asset pro‑rata. (contracts/v2.4.1/PoolLogicV24.sol:154-270)

2) Manager controls trader role and member access
   - ManagedV24 exposes `setTrader/removeTrader` and member allowlist helpers, meaning any UI must surface manager-only trader assignment before trading. (contracts/v2.4.1/ManagedV24.sol:111-122)

3) SDK Express app already wraps common pool admin endpoints
   - `admin` router: create pools, read composition, change assets, and set trader; defaults to Polygon unless `?network=` provided. (dhedge-v2-sdk-examples/express/src/requests/admin.ts:9-63)
   - `invest` router: approve deposits and deposit into a chosen pool. (dhedge-v2-sdk-examples/express/src/requests/invest.ts:9-33)
   - `trade` router: approve a DEX and execute trades via 1inch/UniswapV3, deriving trade size from composition and `share` or `amount` query param. (dhedge-v2-sdk-examples/express/src/requests/trade.ts:10-85)

4) Network/wallet wiring is thin but ready for mainnet
   - Wallet provider picks Infura RPC per network and loads the PRIVATE_KEY signer, so env setup is the main prerequisite. (dhedge-v2-sdk-examples/express/src/wallet.ts:5-24)
   - Polygon gas options helper fetches live gas station data for EIP-1559 fields; other chains use fixed gas limit. (dhedge-v2-sdk-examples/express/src/utils/txOptions.ts:7-18)
   - `poolAddress` constant is a placeholder; routes expect `?pool=` query so this value is only used if callers omit the param. (dhedge-v2-sdk-examples/express/src/config.ts:1)

## Architecture Notes
- V2-Public provides the authoritative on-chain components (factory, pool logic, guards, routers). To mimic dhedge.org you must deploy/configure these contracts per chain and supply asset guard/price configs from `config/`.
- The SDK examples act as a lightweight backend that speaks directly to the deployed contracts via `@dhedge/v2-sdk`; they already expose the minimum admin/invest/trade flows over HTTP, making them a good starting point for a service layer or API proxy behind a UI.
- Recommended path: keep V2-Public as the deploy/build repo for contracts and ABIs; fork/extend dhedge-v2-sdk-examples to add auth, validation, and UI-facing endpoints (including vault listing and performance metrics sourced from subgraph or on-chain composition).

## References
- contracts/v2.4.1/PoolFactoryV24.sol:129-209
- contracts/v2.4.1/PoolLogicV24.sol:154-270
- contracts/v2.4.1/ManagedV24.sol:111-122
- dhedge-v2-sdk-examples/express/src/requests/admin.ts:9-63
- dhedge-v2-sdk-examples/express/src/requests/invest.ts:9-33
- dhedge-v2-sdk-examples/express/src/requests/trade.ts:10-85
- dhedge-v2-sdk-examples/express/src/wallet.ts:5-24
- dhedge-v2-sdk-examples/express/src/utils/txOptions.ts:7-18
- dhedge-v2-sdk-examples/express/src/config.ts:1
