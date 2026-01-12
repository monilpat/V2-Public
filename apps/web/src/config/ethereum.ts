export const ethereumConfig = {
  chainId: 1,
  name: "Ethereum",
  factoryAddress: "0x03d20ef9bdc19736f5e8baf92d4c54f68edcc5d6", // dHEDGE Factory on Ethereum
  maxSupportedAssets: 10,
  performanceFee: {
    maxNumerator: 5000,
    denominator: 10000,
    maxChange: 1000,
    changeDelaySeconds: 4 * 7 * 24 * 60 * 60,
  },
  exitCooldownSeconds: 24 * 60 * 60,
  features: ["Spot Trading", "Lending & Borrowing"],
  dapps: ["1inch", "Aave", "KyberSwap", "Odos", "Pendle"],
  blockExplorer: "https://etherscan.io",
  assets: [
    { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6, isDeposit: true, category: "Stablecoins" },
    { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6, isDeposit: true, category: "Stablecoins" },
    { symbol: "DAI", address: "0x6B175474E89094C44Da98b954EesC510d6d73a62", decimals: 18, isDeposit: true, category: "Stablecoins" },
    { symbol: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18, isDeposit: true, category: "Crypto" },
    { symbol: "WBTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8, isDeposit: false, category: "Crypto" },
    { symbol: "stETH", address: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", decimals: 18, isDeposit: false, category: "Yield" },
    { symbol: "AAVE", address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", decimals: 18, isDeposit: false, category: "Lending" },
  ],
};
