import { ethers } from "ethers";
import { Dhedge, Network } from "@dhedge/v2-sdk";

const POLYGON_NETWORK = { chainId: 137, name: "matic" } as const;
let cachedProvider: ethers.providers.StaticJsonRpcProvider | null = null;

const getProvider = () => {
  if (cachedProvider) return cachedProvider;

  const rpc ='https://polygon-mainnet.g.alchemy.com/v2/rQzQUwgUS3lDBKJSUlN6e';

  // Avoid fetch referrer issues in Node by skipping fetch setup
  const connection: ethers.utils.ConnectionInfo = {
    url: rpc,
    skipFetchSetup: true,
    timeout: 20_000,
  };

  cachedProvider = new ethers.providers.StaticJsonRpcProvider(
    connection,
    POLYGON_NETWORK
  );

  return cachedProvider;
};

// Create a dummy wallet for read-only operations (Dhedge SDK requires Wallet type)
// This wallet is never used to sign transactions, only for read operations
export const getReadOnlyWallet = (): ethers.Wallet => {
  const provider = getProvider();
  // Deterministic dummy key for read-only use; never used to sign
  return new ethers.Wallet(
    "0x0000000000000000000000000000000000000000000000000000000000000001",
    provider
  );
};

// Helper to create Dhedge instance for read-only operations
export const getDhedgeReadOnly = (): Dhedge => {
  const wallet = getReadOnlyWallet();
  return new Dhedge(wallet, Network.POLYGON);
};

// Export provider for direct ethers usage
export { getProvider };
