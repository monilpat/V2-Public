import { ethers, Network } from "@dhedge/v2-sdk";
import { resolveRpcUrl } from "./utils/network";

require("dotenv").config();

const resolvePrivateKey = () =>
  process.env.PRIVATE_KEY ||
  process.env.POLYGON_PRIVATE_KEY ||
  process.env.OPTIMISM_PRIVATE_KEY ||
  process.env.ARBITRUM_PRIVATE_KEY;

export const wallet = (network: Network): ethers.Wallet => {
  const url = resolveRpcUrl(network);
  if (!url) throw Error("RPC not configured for network");

  const pk = resolvePrivateKey();
  if (!pk) throw Error("PRIVATE_KEY not configured");

  return new ethers.Wallet(pk, new ethers.providers.JsonRpcProvider(url));
};
