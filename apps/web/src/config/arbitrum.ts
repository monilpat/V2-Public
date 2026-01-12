export const arbitrumConfig = {
  chainId: 42161,
  name: "Arbitrum",
  factoryAddress: "0xffFB5fB14606EB3a548C113026355020bDFb09b2", // dHEDGE Factory on Arbitrum
  maxSupportedAssets: 10,
  performanceFee: {
    maxNumerator: 5000,
    denominator: 10000,
    maxChange: 1000,
    changeDelaySeconds: 4 * 7 * 24 * 60 * 60,
  },
  exitCooldownSeconds: 24 * 60 * 60,
  features: ["Spot Trading", "Lending & Borrowing", "Liquidity Provision", "Leverage"],
  dapps: ["1inch", "Aave", "Compound", "Fluid", "KyberSwap", "Odos", "PancakeSwap", "Toros", "Uniswap"],
  blockExplorer: "https://arbiscan.io",
  assets: [
    { symbol: "USDC", address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6, isDeposit: true, category: "Stablecoins" },
    { symbol: "USDC.e", address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", decimals: 6, isDeposit: true, category: "Stablecoins" },
    { symbol: "USDT", address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", decimals: 6, isDeposit: true, category: "Stablecoins" },
    { symbol: "DAI", address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", decimals: 18, isDeposit: true, category: "Stablecoins" },
    { symbol: "WETH", address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", decimals: 18, isDeposit: true, category: "Crypto" },
    { symbol: "WBTC", address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", decimals: 8, isDeposit: false, category: "Crypto" },
    { symbol: "ARB", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", decimals: 18, isDeposit: false, category: "Crypto" },
    { symbol: "GMX", address: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a", decimals: 18, isDeposit: false, category: "Crypto" },
  ],
};
