export const polygonConfig = {
  factoryAddress: "0xfdc7b8bFe0DD3513Cc669bB8d601Cb83e2F69cB0", // PoolFactoryProxy (Polygon prod)
  maxSupportedAssets: 10,
  performanceFee: {
    maxNumerator: 5000,
    denominator: 10000,
    maxChange: 1000,
    changeDelaySeconds: 4 * 7 * 24 * 60 * 60, // 4 weeks
  },
  exitCooldownSeconds: 24 * 60 * 60, // 1 day
  pools: [
    // seed with known pools; replace with live factory query or env list
    { name: "Sample Pool", address: "0x0000000000000000000000000000000000000000", symbol: "POOL" },
  ],
  assets: [
    { symbol: "USDC", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6, isDeposit: true },
    { symbol: "USDT", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6, isDeposit: true },
    { symbol: "DAI", address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", decimals: 18, isDeposit: true },
    { symbol: "WETH", address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", decimals: 18, isDeposit: false },
    { symbol: "WBTC", address: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6", decimals: 8, isDeposit: false },
    { symbol: "WMATIC", address: "0x0d500B1d8E8ef31E21C99d1Db9A6444d3ADf1270", decimals: 18, isDeposit: true },
    { symbol: "DHT", address: "0x8C92e38eCA8210f4fcBf17F0951b198Dd7668292", decimals: 18, isDeposit: false },
  ],
};
