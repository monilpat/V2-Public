import { ethers } from "ethers";
import PoolFactoryAbi from "../../abi/PoolFactory.json";
import { polygonConfig } from "../config/polygon";
import { resolveRpcUrl, resolveNetwork } from "./network";
import { Network } from "@dhedge/v2-sdk";

export const getProvider = (network: Network) => {
  const rpc = resolveRpcUrl(network);
  if (!rpc) throw new Error("RPC not configured");
  return new ethers.providers.JsonRpcProvider(rpc);
};

export const getFactory = (network: Network) => {
  const provider = getProvider(network);
  return new ethers.Contract(polygonConfig.factoryAddress, PoolFactoryAbi, provider);
};
