import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { Dhedge, Network } from "@dhedge/v2-sdk";
import { formatUnits } from "ethers/lib/utils";
import { polygonConfig } from "@/config/polygon";

const FACTORY_ABI = [
  "function getDeployedFunds() view returns (address[])",
];

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
];

const getProvider = () => {
  const rpc = process.env.NEXT_PUBLIC_POLYGON_RPC;
  if (!rpc) throw new Error("NEXT_PUBLIC_POLYGON_RPC not configured");
  return new ethers.providers.JsonRpcProvider(rpc);
};

const getFactory = () => {
  const provider = getProvider();
  return new ethers.Contract(polygonConfig.factoryAddress, FACTORY_ABI, provider);
};

const computeTvl = async (composition: any[]): Promise<number> => {
  let total = 0;
  for (const item of composition) {
    try {
      const balance = BigInt(item.balance.hex || item.balance._hex || item.balance);
      const decimals = item.decimals || 18;
      const balanceFormatted = Number(formatUnits(balance, decimals));
      const price = 1; // Stub - replace with actual price fetching
      total += balanceFormatted * price;
    } catch (e) {
      continue;
    }
  }
  return total;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const userAddress = params.address;
    const provider = getProvider();
    const factory = getFactory();
    const pools: string[] = await factory.getDeployedFunds();
    const dhedge = new Dhedge(provider, Network.POLYGON);

    const deposits = await Promise.all(
      pools.map(async (poolAddress) => {
        try {
          const pool = await dhedge.loadPool(poolAddress);
          const contract = new ethers.Contract(poolAddress, ERC20_ABI, provider);
          const balance = await contract.balanceOf(userAddress);
          
          if (balance.eq(0)) return null;

          const [name, symbol, decimals, totalSupply] = await Promise.all([
            contract.name(),
            contract.symbol(),
            contract.decimals(),
            contract.totalSupply(),
          ]);

          const composition = await pool.getComposition();
          const tvl = await computeTvl(composition);
          const sharePrice = totalSupply.gt(0) ? tvl / Number(ethers.utils.formatEther(totalSupply)) : 1;
          const value = Number(ethers.utils.formatEther(balance)) * sharePrice;

          return {
            pool: poolAddress,
            name,
            symbol,
            balance: ethers.utils.formatEther(balance),
            sharePrice,
            value,
            pnl: 0, // Stub: would need cost basis
          };
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json({
      status: "success",
      deposits: deposits.filter((d) => d !== null),
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "fail", msg: err?.message || err },
      { status: 400 }
    );
  }
}
