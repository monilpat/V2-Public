import { ethers } from "ethers";
import { Dhedge, Network } from "@dhedge/v2-sdk";

const getProvider = () => {
  const rpc = process.env.NEXT_PUBLIC_POLYGON_RPC;
  if (!rpc) throw new Error("NEXT_PUBLIC_POLYGON_RPC not configured");
  return new ethers.providers.JsonRpcProvider(rpc);
};

// Create a dummy wallet for read-only operations (Dhedge SDK requires Wallet type)
// This wallet is never used to sign transactions, only for read operations
export const getReadOnlyWallet = (): ethers.Wallet => {
  const provider = getProvider();
  // Use a dummy private key - only used for read operations, never signs
  return new ethers.Wallet("0x0000000000000000000000000000000000000000000000000000000000000001", provider);
};

// Helper to create Dhedge instance for read-only operations
export const getDhedgeReadOnly = (): Dhedge => {
  const wallet = getReadOnlyWallet();
  return new Dhedge(wallet, Network.POLYGON);
};

// Export provider for direct ethers usage
export { getProvider };
