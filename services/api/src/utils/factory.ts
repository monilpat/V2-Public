import { ethers } from "ethers";
import PoolFactoryAbi from "../../abi/PoolFactory.json";
import { polygonConfig } from "../config/polygon";

const rpcUrl = process.env.INFURA_PROJECT_ID
  ? `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
  : process.env.POLYGON_RPC_URL;

export const provider = rpcUrl ? new ethers.providers.JsonRpcProvider(rpcUrl) : undefined;

export const getFactory = () => {
  if (!provider) throw new Error("RPC not configured");
  return new ethers.Contract(polygonConfig.factoryAddress, PoolFactoryAbi, provider);
};
