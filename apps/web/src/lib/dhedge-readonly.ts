import { ethers } from "ethers";
import { Dhedge, Network } from "@dhedge/v2-sdk";

const getProvider = () => {
  const rpc =
   'https://polygon-mainnet.g.alchemy.com/v2/rQzQUwgUS3lDBKJSUlN6e';
  if (!rpc) {
    console.error("Polygon RPC not configured: no env found");
    throw new Error("Polygon RPC not configured");
  }
  // Log first part only to avoid leaking full URL/token
  console.log("Using Polygon RPC:", `${rpc.slice(0, 32)}...`);
  // Avoid fetch referrer issues in Node by skipping fetch setup
  const connection: ethers.utils.ConnectionInfo = {
    url: rpc,
    skipFetchSetup: true,
    timeout: 60_000
  };
  return new ethers.providers.StaticJsonRpcProvider(connection, {
    name: "matic",
    chainId: 137,
  });
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
