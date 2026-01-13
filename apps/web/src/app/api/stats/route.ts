import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getDhedgeReadOnly, getProvider } from "@/lib/dhedge-readonly";
import { polygonConfig } from "@/config/polygon";
import { fetchPriceUSD } from "@/lib/prices";

// Force dynamic to prevent static generation issues.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// Set max duration to prevent Vercel timeout (60s for Pro, 10s for Hobby)
export const maxDuration = 60;

// Configuration with env var overrides
const STATS_CACHE_TTL_MS = Number(process.env.STATS_CACHE_TTL_MS || "300000"); // 5 min default
const STATS_MAX_POOLS = Number(process.env.STATS_MAX_POOLS || "15"); // Limit pools to process
const STATS_FEE_LOOKBACK_BLOCKS = Number(process.env.STATS_FEE_LOOKBACK_BLOCKS || "200000"); // ~7 days

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

// Default empty stats response
const emptyStats = {
  totalTvl: 0,
  vaultCount: 0,
  managerCount: 0,
  totalFees: 0,
  networks: [] as Array<{
    network: string;
    tvl: number;
    vaults: number;
    managers: number;
    fees: number;
  }>,
};

// In-memory cache for stats
type StatsData = typeof emptyStats;
type StatsCache = { 
  fetchedAt: number; 
  stats: StatsData;
  totalPoolCount: number;
  processedPoolCount: number;
};
let statsCache: StatsCache | null = null;
let isComputingStats = false;

// Cache helpers
const getCachedStats = (): StatsCache | null => {
  if (!statsCache) return null;
  if (Date.now() - statsCache.fetchedAt > STATS_CACHE_TTL_MS) return null;
  return statsCache;
};

const getStaleCachedStats = (): StatsCache | null => {
  // Return stale cache (up to 1 hour old) for immediate response
  if (!statsCache) return null;
  if (Date.now() - statsCache.fetchedAt > 3600000) return null; // 1 hour max stale
  return statsCache;
};

const setCachedStats = (stats: StatsData, totalPoolCount: number, processedPoolCount: number) => {
  statsCache = { 
    fetchedAt: Date.now(), 
    stats,
    totalPoolCount,
    processedPoolCount,
  };
};

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

// Helper to get total fees from a pool (optimized with reduced lookback)
const getPoolFees = async (poolAddress: string): Promise<number> => {
  try {
    const provider = getProvider();
    const poolContract = new ethers.Contract(poolAddress, POOL_LOGIC_ABI, provider);
    
    const currentBlock = await provider.getBlockNumber();
    // Reduced lookback: ~7 days instead of ~90 days for faster queries
    const fromBlock = Math.max(0, currentBlock - STATS_FEE_LOOKBACK_BLOCKS);
    
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

// Background computation function (doesn't block response)
const computeStatsInBackground = async () => {
  if (isComputingStats) return; // Prevent concurrent computations
  isComputingStats = true;
  
  try {
    const factory = getFactory();
    let pools: string[] = [];
    
    try {
      pools = await factory.getDeployedFunds();
    } catch (e: any) {
      console.error("Background stats: Failed to fetch deployed funds:", e?.message);
      isComputingStats = false;
      return;
    }
    
    if (!pools || pools.length === 0) {
      setCachedStats(emptyStats, 0, 0);
      isComputingStats = false;
      return;
    }

    let dhedge;
    try {
      dhedge = getDhedgeReadOnly();
    } catch (e: any) {
      console.error("Background stats: Failed to initialize dHEDGE SDK:", e?.message);
      isComputingStats = false;
      return;
    }

    const totalPoolCount = pools.length;
    // Limit pools to process to avoid timeout
    const poolsToProcess = pools.slice(0, STATS_MAX_POOLS);
    
    let totalTvl = 0;
    let totalFees = 0;
    const managerSet = new Set<string>();

    // Process pools in batches
    const batchSize = 5; // Smaller batch size for reliability
    for (let i = 0; i < poolsToProcess.length; i += batchSize) {
      const batch = poolsToProcess.slice(i, i + batchSize);
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
          // Skip failed pools silently
        }
      }));
    }

    const stats: StatsData = {
      totalTvl,
      vaultCount: totalPoolCount, // Report total pool count even if we only processed some
      managerCount: managerSet.size,
      totalFees: Math.round(totalFees * 100) / 100,
      networks: [
        {
          network: "Polygon",
          tvl: totalTvl,
          vaults: totalPoolCount,
          managers: managerSet.size,
          fees: Math.round(totalFees * 100) / 100,
        },
      ],
    };
    
    setCachedStats(stats, totalPoolCount, poolsToProcess.length);
  } catch (err: any) {
    console.error("Background stats computation error:", err?.message);
  } finally {
    isComputingStats = false;
  }
};

export async function GET(request: NextRequest) {
  try {
    // Check for fresh cached stats first
    const cached = getCachedStats();
    if (cached) {
      return NextResponse.json({
        status: "success",
        stats: cached.stats,
        cached: true,
        cacheAge: Date.now() - cached.fetchedAt,
        totalPools: cached.totalPoolCount,
        processedPools: cached.processedPoolCount,
      });
    }
    
    // Check for stale cache - return immediately and trigger background refresh
    const staleCache = getStaleCachedStats();
    if (staleCache) {
      // Trigger background refresh (non-blocking)
      computeStatsInBackground().catch(console.error);
      
      return NextResponse.json({
        status: "cached",
        stats: staleCache.stats,
        cached: true,
        stale: true,
        cacheAge: Date.now() - staleCache.fetchedAt,
        totalPools: staleCache.totalPoolCount,
        processedPools: staleCache.processedPoolCount,
        message: "Returning stale cache while refreshing in background",
      });
    }
    
    // No cache at all - compute fresh stats (blocking)
    const factory = getFactory();
    let pools: string[] = [];
    try {
      pools = await factory.getDeployedFunds();
    } catch (e: any) {
      console.error("Failed to fetch deployed funds:", e?.message);
      return NextResponse.json({
        status: "partial",
        stats: emptyStats,
        error: "Failed to fetch pool data from blockchain",
      });
    }
    
    if (!pools || pools.length === 0) {
      return NextResponse.json({
        status: "success",
        stats: emptyStats,
      });
    }

    let dhedge;
    try {
      dhedge = getDhedgeReadOnly();
    } catch (e: any) {
      console.error("Failed to initialize dHEDGE SDK:", e?.message);
      return NextResponse.json({
        status: "partial",
        stats: {
          ...emptyStats,
          vaultCount: pools.length,
          networks: [{
            network: "Polygon",
            tvl: 0,
            vaults: pools.length,
            managers: 0,
            fees: 0,
          }],
        },
        error: "Failed to initialize SDK",
      });
    }

    const totalPoolCount = pools.length;
    // Limit pools to process to avoid timeout
    const poolsToProcess = pools.slice(0, STATS_MAX_POOLS);
    
    let totalTvl = 0;
    let totalFees = 0;
    const managerSet = new Set<string>();

    // Process pools in smaller batches for reliability
    const batchSize = 5;
    for (let i = 0; i < poolsToProcess.length; i += batchSize) {
      const batch = poolsToProcess.slice(i, i + batchSize);
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
          // Skip failed pools silently
        }
      }));
    }

    const stats: StatsData = {
      totalTvl,
      vaultCount: totalPoolCount, // Report total pool count
      managerCount: managerSet.size,
      totalFees: Math.round(totalFees * 100) / 100,
      networks: [
        {
          network: "Polygon",
          tvl: totalTvl,
          vaults: totalPoolCount,
          managers: managerSet.size,
          fees: Math.round(totalFees * 100) / 100,
        },
      ],
    };
    
    // Cache the results
    setCachedStats(stats, totalPoolCount, poolsToProcess.length);

    return NextResponse.json({
      status: "success",
      stats,
      cached: false,
      totalPools: totalPoolCount,
      processedPools: poolsToProcess.length,
    });
  } catch (err: any) {
    console.error("Stats route error:", err?.message);
    // Return valid JSON with empty stats instead of 400 error
    return NextResponse.json({
      status: "partial",
      stats: emptyStats,
      error: err?.message || "Unknown error",
    });
  }
}
