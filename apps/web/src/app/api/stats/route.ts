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
  "event ManagerFeeMinted(address pool, address manager, uint256 available, uint256 daoFee, uint256 managerFee, uint256 tokenPriceAtLastFeeMint)",
  "event EntryFeeMinted(address manager, uint256 entryFeeAmount)",
  "event ExitFeeMinted(address manager, uint256 exitFeeAmount)",
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

// Helper to get total fees from a pool
const getPoolFees = async (poolAddress: string): Promise<number> => {
  try {
    const provider = getProvider();
    const poolContract = new ethers.Contract(poolAddress, POOL_LOGIC_ABI, provider);
    
    const currentBlock = await provider.getBlockNumber();
    // Look back ~90 days of blocks
    const fromBlock = Math.max(0, currentBlock - 2_000_000);
    
    let totalFees = 0;
    
    // Query ManagerFeeMinted events
    try {
      const managerFeeFilter = poolContract.filters.ManagerFeeMinted();
      const managerFeeEvents = await poolContract.queryFilter(managerFeeFilter, fromBlock, currentBlock);
      
      for (const event of managerFeeEvents) {
        const args = event.args;
        if (args) {
          // daoFee + managerFee are in pool token units (18 decimals)
          const daoFee = args.daoFee ? Number(ethers.utils.formatEther(args.daoFee)) : 0;
          const managerFee = args.managerFee ? Number(ethers.utils.formatEther(args.managerFee)) : 0;
          const tokenPrice = args.tokenPriceAtLastFeeMint 
            ? Number(ethers.utils.formatEther(args.tokenPriceAtLastFeeMint)) 
            : 1;
          // Convert to USD value
          totalFees += (daoFee + managerFee) * tokenPrice;
        }
      }
    } catch {
      // Ignore errors for individual event queries
    }
    
    // Query EntryFeeMinted events
    try {
      const entryFeeFilter = poolContract.filters.EntryFeeMinted();
      const entryFeeEvents = await poolContract.queryFilter(entryFeeFilter, fromBlock, currentBlock);
      
      for (const event of entryFeeEvents) {
        const args = event.args;
        if (args?.entryFeeAmount) {
          // Entry fees are in pool token units
          totalFees += Number(ethers.utils.formatEther(args.entryFeeAmount));
        }
      }
    } catch {
      // Ignore errors
    }
    
    // Query ExitFeeMinted events
    try {
      const exitFeeFilter = poolContract.filters.ExitFeeMinted();
      const exitFeeEvents = await poolContract.queryFilter(exitFeeFilter, fromBlock, currentBlock);
      
      for (const event of exitFeeEvents) {
        const args = event.args;
        if (args?.exitFeeAmount) {
          // Exit fees are in pool token units
          totalFees += Number(ethers.utils.formatEther(args.exitFeeAmount));
        }
      }
    } catch {
      // Ignore errors
    }
    
    return totalFees;
  } catch (e) {
    return 0;
  }
};

export async function GET(request: NextRequest) {
  try {
    const factory = getFactory();
    const pools: string[] = await factory.getDeployedFunds();
    const dhedge = getDhedgeReadOnly();

    let totalTvl = 0;
    let totalFees = 0;
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
          
          // Get fees for this pool
          const poolFees = await getPoolFees(poolAddr);
          totalFees += poolFees;
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
        totalFees: Math.round(totalFees * 100) / 100, // Round to 2 decimals
        networks: [
          {
            network: "Polygon",
            tvl: totalTvl,
            vaults: pools.length,
            managers: managerSet.size,
            fees: Math.round(totalFees * 100) / 100,
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
