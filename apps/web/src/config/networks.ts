import { ethereumConfig } from "./ethereum";
import { polygonConfig } from "./polygon";
import { optimismConfig } from "./optimism";
import { arbitrumConfig } from "./arbitrum";
import { baseConfig } from "./base";

export type NetworkConfig = {
  chainId: number;
  name: string;
  factoryAddress: string;
  maxSupportedAssets: number;
  performanceFee: {
    maxNumerator: number;
    denominator: number;
    maxChange: number;
    changeDelaySeconds: number;
  };
  exitCooldownSeconds: number;
  features: string[];
  dapps: string[];
  blockExplorer: string;
  assets: {
    symbol: string;
    address: string;
    decimals: number;
    isDeposit: boolean;
    category: string;
  }[];
  pools?: { name: string; address: string; symbol: string }[];
};

export const networks: Record<number, NetworkConfig> = {
  1: ethereumConfig as NetworkConfig,
  137: polygonConfig as NetworkConfig,
  10: optimismConfig as NetworkConfig,
  42161: arbitrumConfig as NetworkConfig,
  8453: baseConfig as NetworkConfig,
};

export const networkList = [
  ethereumConfig,
  polygonConfig,
  optimismConfig,
  arbitrumConfig,
  baseConfig,
] as NetworkConfig[];

// Network icons (SVG paths or URLs)
export const networkIcons: Record<number, string> = {
  1: "/icons/ethereum.svg",
  137: "/icons/polygon.svg",
  10: "/icons/optimism.svg",
  42161: "/icons/arbitrum.svg",
  8453: "/icons/base.svg",
};

// DApp logos
export const dappLogos: Record<string, string> = {
  "1inch": "/dapps/1inch.svg",
  "Aave": "/dapps/aave.svg",
  "Aerodrome": "/dapps/aerodrome.svg",
  "Compound": "/dapps/compound.svg",
  "Fluid": "/dapps/fluid.svg",
  "KyberSwap": "/dapps/kyberswap.svg",
  "Odos": "/dapps/odos.svg",
  "PancakeSwap": "/dapps/pancakeswap.svg",
  "Pendle": "/dapps/pendle.svg",
  "Toros": "/dapps/toros.svg",
  "Uniswap": "/dapps/uniswap.svg",
  "Velodrome": "/dapps/velodrome.svg",
};

// Asset categories
export const assetCategories = [
  "Commodities",
  "Crypto",
  "Lending",
  "Stablecoins",
  "Yield",
] as const;

export type AssetCategory = typeof assetCategories[number];

// Helper to get network by chain ID
export const getNetworkConfig = (chainId: number): NetworkConfig | undefined => {
  return networks[chainId];
};

// Helper to get assets by category
export const getAssetsByCategory = (
  chainId: number,
  category: AssetCategory
): NetworkConfig["assets"] => {
  const config = networks[chainId];
  if (!config) return [];
  return config.assets.filter((a) => a.category === category);
};

export { ethereumConfig, polygonConfig, optimismConfig, arbitrumConfig, baseConfig };
