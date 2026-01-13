import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getDhedgeReadOnly, getProvider } from "@/lib/dhedge-readonly";
import { polygonConfig } from "@/config/polygon";
import { fetchPriceUSD } from "@/lib/prices";

const FACTORY_ABI = [
  "function getDeployedFunds() view returns (address[])",
];

const POOL_LOGIC_ABI = [
  "function poolManagerLogic() view returns (address)",
];

const MANAGER_ABI = [
  "function manager() view returns (address)",
];

const getFactory = () => {
  const provider = getProvider();
  return new ethers.Contract(polygonConfig.factoryAddress, FACTORY_ABI, provider);
};

// Helper to get manager address for a pool
const getPoolManager = async (poolAddress: string): Promise<string | null> => {
  try {
    const provider = getProvider();
    const poolContract = new ethers.Contract(poolAddress, POOL_LOGIC_ABI, provider);
    const managerLogicAddress = await poolContract.poolManagerLogic();
    
    if (!managerLogicAddress || managerLogicAddress === ethers.constants.AddressZero) {
      return null;
    }

    const managerContract = new ethers.Contract(managerLogicAddress, MANAGER_ABI, provider);
    const manager = await managerContract.manager();
    
    if (manager && manager !== ethers.constants.AddressZero) {
      return manager.toLowerCase();
    }
    return null;
  } catch (e) {
    return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    const factory = getFactory();
    const pools: string[] = await factory.getDeployedFunds();
    const dhedge = getDhedgeReadOnly();

    let totalTvl = 0;
    const managerSet = new Set<string>();

    // Process pools in batches to avoid timeout
    const batchSize = 10;
    for (let i = 0; i < pools.length; i += batchSize) {
      const batch = pools.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (poolAddr) => {
        try {
          // Get manager address and add to set
          const manager = await getPoolManager(poolAddr);
          if (manager) {
            managerSet.add(manager);
          }

          // Calculate TVL
          const pool = await dhedge.loadPool(poolAddr);
          const composition = await pool.getComposition();
          
          let tvl = 0;
          for (const item of composition) {
            try {
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
          // Skip failed pools
        }
      }));
    }

    return NextResponse.json({
      status: "success",
      stats: {
        totalTvl,
        vaultCount: pools.length,
        managerCount: managerSet.size,
        totalFees: 0, // Would require tracking fee events to calculate
        networks: [
          {
            network: "Polygon",
            tvl: totalTvl,
            vaults: pools.length,
            managers: managerSet.size,
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
