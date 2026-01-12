import { ethers } from "ethers";
import PoolFactoryAbi from "../../abi/PoolFactory.json";
import { polygonConfig } from "../config/polygon";
import { resolveRpcUrl } from "./network";
import { Network } from "@dhedge/v2-sdk";

export const getProvider = (network: Network) => {
  const rpc = resolveRpcUrl(network);
  if (!rpc) throw new Error("RPC not configured");
  return new ethers.providers.JsonRpcProvider(rpc);
};

export const getFactory = (network: Network) => {
  const provider = getProvider(network);
  // Polygon-only factory address for MVP
  return new ethers.Contract(polygonConfig.factoryAddress, PoolFactoryAbi, provider);
};

// Backwards compat default provider (Polygon)
export const provider = getProvider(Network.POLYGON);
