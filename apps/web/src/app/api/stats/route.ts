import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getDhedgeReadOnly, getProvider } from "@/lib/dhedge-readonly";
import { polygonConfig } from "@/config/polygon";
import { fetchPriceUSD } from "@/lib/prices";

const FACTORY_ABI = [
  "function getDeployedFunds() view returns (address[])",
];

const getFactory = () => {
  const provider = getProvider();
  return new ethers.Contract(polygonConfig.factoryAddress, FACTORY_ABI, provider);
};

export async function GET(request: NextRequest) {
  try {
    const provider = getProvider();
    const factory = getFactory();
    const pools: string[] = await factory.getDeployedFunds();
    const dhedge = getDhedgeReadOnly();

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
            // Handle BigNumber from ethers - it has _hex property, not hex
            const balanceValue = (item.balance as any)?._hex || (item.balance as any)?.hex || item.balance;
            const balance = BigInt(balanceValue);
            const decimals = (item as any).decimals || 18;
            const balanceFormatted = Number(ethers.utils.formatUnits(balance, decimals));
            const price = await fetchPriceUSD(item.asset);
            tvl += balanceFormatted * (price || 0);
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
