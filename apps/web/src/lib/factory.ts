import { polygonConfig } from "@/lib/polygon";
import { erc20Abi, createPublicClient, http } from "viem";
import { polygon } from "wagmi/chains";

const client = createPublicClient({
  chain: polygon,
  transport: http(process.env.NEXT_PUBLIC_POLYGON_RPC || "https://polygon-mainnet.g.alchemy.com/v2/demo"),
});

export const fetchPoolMeta = async (address: string) => {
  try {
    const [name, symbol] = await Promise.all([
      client.readContract({ address: address as `0x${string}`, abi: erc20Abi, functionName: "name" }),
      client.readContract({ address: address as `0x${string}`, abi: erc20Abi, functionName: "symbol" }),
    ]);
    return { name: name as string, symbol: symbol as string };
  } catch {
    return { name: address.slice(0, 6) + "…", symbol: "POOL" };
  }
};
