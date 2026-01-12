export const baseConfig = {
  chainId: 8453,
  name: "Base",
  factoryAddress: "0xc6bC73D31817B00D42528929E471F20855386a00", // dHEDGE Factory on Base
  maxSupportedAssets: 10,
  performanceFee: {
    maxNumerator: 5000,
    denominator: 10000,
    maxChange: 1000,
    changeDelaySeconds: 4 * 7 * 24 * 60 * 60,
  },
  exitCooldownSeconds: 24 * 60 * 60,
  features: ["Spot Trading", "Lending & Borrowing", "Liquidity Provision"],
  dapps: ["1inch", "Aave", "Aerodrome", "Compound", "Fluid", "KyberSwap", "Odos", "PancakeSwap"],
  blockExplorer: "https://basescan.org",
  assets: [
    { symbol: "USDC", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6, isDeposit: true, category: "Stablecoins" },
    { symbol: "USDbC", address: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA", decimals: 6, isDeposit: true, category: "Stablecoins" },
    { symbol: "DAI", address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", decimals: 18, isDeposit: true, category: "Stablecoins" },
    { symbol: "WETH", address: "0x4200000000000000000000000000000000000006", decimals: 18, isDeposit: true, category: "Crypto" },
    { symbol: "cbETH", address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22", decimals: 18, isDeposit: false, category: "Yield" },
    { symbol: "rETH", address: "0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c", decimals: 18, isDeposit: false, category: "Yield" },
  ],
};
