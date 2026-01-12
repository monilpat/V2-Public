import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { Dhedge, Network } from "@dhedge/v2-sdk";
import { polygonConfig } from "@/config/polygon";

const FACTORY_ABI = [
  "function getDeployedFunds() view returns (address[])",
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

export async function GET(request: NextRequest) {
  try {
    const provider = getProvider();
    const factory = getFactory();
    const pools: string[] = await factory.getDeployedFunds();
    const dhedge = new Dhedge(provider, Network.POLYGON);

    let totalTvl = 0;
    const managerSet = new Set<string>();

    for (const poolAddr of pools) {
      try {
        const pool = await dhedge.loadPool(poolAddr);
        const composition = await pool.getComposition();
        
        // Simple TVL calculation (stub - you can enhance with real prices)
        let tvl = 0;
        for (const item of composition) {
          try {
            const balance = BigInt(item.balance.hex || item.balance._hex || item.balance);
            const decimals = item.decimals || 18;
            const balanceFormatted = Number(ethers.utils.formatUnits(balance, decimals));
            tvl += balanceFormatted; // Stub: using 1:1 price
          } catch (e) {
            continue;
          }
        }
        totalTvl += tvl;
      } catch (e) {
        continue;
      }
    }

    return NextResponse.json({
      status: "success",
      stats: {
        totalTvl,
        vaultCount: pools.length,
        managerCount: managerSet.size || 0,
        totalFees: 0,
        networks: [
          {
            network: "Polygon",
            tvl: totalTvl,
            vaults: pools.length,
            managers: managerSet.size || 0,
            fees: 0,
          },
        ],
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "fail", msg: err?.message || err },
      { status: 400 }
    );
  }
}
