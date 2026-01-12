"use client";
import { polygon } from "wagmi/chains";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo";

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [polygon],
  ssr: true,
  transports: {
    [polygon.id]: {
      http: process.env.NEXT_PUBLIC_POLYGON_RPC || "https://polygon-mainnet.g.alchemy.com/v2/demo",
    },
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
export const appKit = wagmiAdapter;
