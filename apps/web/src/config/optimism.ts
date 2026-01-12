export const optimismConfig = {
  chainId: 10,
  name: "Optimism",
  factoryAddress: "0x5e61a079A178f0E5784107a4963baAe0c5a680c6", // dHEDGE Factory on Optimism
  maxSupportedAssets: 10,
  performanceFee: {
    maxNumerator: 5000,
    denominator: 10000,
    maxChange: 1000,
    changeDelaySeconds: 4 * 7 * 24 * 60 * 60,
  },
  exitCooldownSeconds: 24 * 60 * 60,
  features: ["Spot Trading", "Lending & Borrowing", "Leverage", "Liquidity Provision"],
  dapps: ["1inch", "Aave", "Compound", "KyberSwap", "Odos", "Toros", "Uniswap", "Velodrome"],
  blockExplorer: "https://optimistic.etherscan.io",
  assets: [
    { symbol: "USDC", address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", decimals: 6, isDeposit: true, category: "Stablecoins" },
    { symbol: "USDT", address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", decimals: 6, isDeposit: true, category: "Stablecoins" },
    { symbol: "DAI", address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", decimals: 18, isDeposit: true, category: "Stablecoins" },
    { symbol: "WETH", address: "0x4200000000000000000000000000000000000006", decimals: 18, isDeposit: true, category: "Crypto" },
    { symbol: "WBTC", address: "0x68f180fcCe6836688e9084f035309E29Bf0A2095", decimals: 8, isDeposit: false, category: "Crypto" },
    { symbol: "OP", address: "0x4200000000000000000000000000000000000042", decimals: 18, isDeposit: false, category: "Crypto" },
    { symbol: "sUSD", address: "0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9", decimals: 18, isDeposit: true, category: "Stablecoins" },
    { symbol: "SNX", address: "0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4", decimals: 18, isDeposit: false, category: "Crypto" },
  ],
};
