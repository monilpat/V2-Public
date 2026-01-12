import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";

export const supportedChains = [polygon, mainnet, optimism, arbitrum, base];

export const chainName = (id: number) => {
  const c = supportedChains.find((c) => c.id === id);
  return c?.name || "Unknown";
};
