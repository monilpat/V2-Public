import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getDhedgeReadOnly, getProvider } from "@/lib/dhedge-readonly";
import { polygonConfig } from "@/config/polygon";
import { fetchPriceUSD } from "@/lib/prices";
import { getHistoricalPrices, findPriceAtTimestamp } from "@/lib/historical-prices";

// Simple ERC20 ABI for name/symbol
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
];

// PoolFactory ABI (minimal)
const FACTORY_ABI = [
  "function getDeployedFunds() view returns (address[])",
  "event FundCreated(address fundAddress,bool isPoolPrivate,string fundName,string managerName,address manager,uint256 time,uint256 performanceFeeNumerator,uint256 managerFeeNumerator,uint256 managerFeeDenominator)",
];


// Helper to get factory
const getFactory = () => {
  const provider = getProvider();
  return new ethers.Contract(polygonConfig.factoryAddress, FACTORY_ABI, provider);
};

const getFundCreatedTopic = () =>
  new ethers.utils.Interface(FACTORY_ABI).getEventTopic("FundCreated");

const getStartBlock = async (provider: ethers.providers.Provider) => {
  const envStart = Number(process.env.POOL_FACTORY_START_BLOCK);
  if (Number.isFinite(envStart) && envStart > 0) return envStart;
  // Default to a recent window to avoid massive log scans on serverless.
  const latest = await provider.getBlockNumber();
  return Math.max(0, latest - 1_000_000);
};

const fetchPoolsFromLogs = async (): Promise<string[]> => {
  const provider = getProvider();
  const topic = getFundCreatedTopic();
  const latest = await provider.getBlockNumber();
  const start = await getStartBlock(provider);
  const step = 50_000;
  const pools: string[] = [];
  const iface = new ethers.utils.Interface(FACTORY_ABI);

  for (let from = start; from <= latest; from += step) {
    const to = Math.min(from + step - 1, latest);
    const logs = await provider.getLogs({
      address: polygonConfig.factoryAddress,
      fromBlock: from,
      toBlock: to,
      topics: [topic],
    });
    for (const log of logs) {
      try {
        const parsed = iface.parseLog(log);
        const addr = (parsed?.args?.fundAddress as string) || "";
        if (addr) pools.push(addr);
      } catch {
        // Ignore parse errors
      }
    }
  }
  return pools;
};

// Helper to compute TVL from composition
const computeTvl = async (composition: any[]): Promise<number> => {
  let total = 0;
  
  for (const item of composition) {
    try {
      // Handle BigNumber from ethers - it has _hex property, not hex
      const balanceValue = (item.balance as any)?._hex || (item.balance as any)?.hex || item.balance;
      const balance = BigInt(balanceValue);
      const decimals = (item as any).decimals || 18;
      const balanceFormatted = Number(ethers.utils.formatUnits(balance, decimals));
      const price = await fetchPriceUSD(item.asset);
      total += balanceFormatted * (price || 0);
    } catch (e) {
      continue;
    }
  }
  return total;
};

// Calculate returns for a pool (lighter version for list view)
const getPoolReturnsLight = async (
  poolAddress: string,
  currentSharePrice: number
): Promise<{ returns24h: number; returns1w: number; returns1m: number }> => {
  try {
    // Use a smaller block lookback for list view to improve performance
    const historicalPrices = await getHistoricalPrices(poolAddress, 200_000);
    
    if (historicalPrices.length === 0) {
      return { returns24h: 0, returns1w: 0, returns1m: 0 };
    }
    
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
    
    const price24h = findPriceAtTimestamp(historicalPrices, oneDayAgo, currentSharePrice);
    const price1w = findPriceAtTimestamp(historicalPrices, oneWeekAgo, currentSharePrice);
    const price1m = findPriceAtTimestamp(historicalPrices, oneMonthAgo, currentSharePrice);
    
    const returns24h = price24h > 0 ? ((currentSharePrice - price24h) / price24h) * 100 : 0;
    const returns1w = price1w > 0 ? ((currentSharePrice - price1w) / price1w) * 100 : 0;
    const returns1m = price1m > 0 ? ((currentSharePrice - price1m) / price1m) * 100 : 0;
    
    return { returns24h, returns1w, returns1m };
  } catch {
    return { returns24h: 0, returns1w: 0, returns1m: 0 };
  }
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const network = searchParams.get("network");
    const debug = searchParams.get("debug") === "1";
    
    // For now, only support Polygon (137). Network parameter is accepted but ignored.
    // This allows the frontend to pass it without errors.
    if (network && network !== "137" && network !== "polygon") {
      return NextResponse.json(
        { status: "fail", msg: "Only Polygon network (137) is currently supported" },
        { status: 400 }
      );
    }
    
    let pools: string[] = [];
    let debugInfo: Record<string, any> | undefined;
    const provider = getProvider();
    const latest = await provider.getBlockNumber();
    const start = await getStartBlock(provider);
    let logError: string | undefined;
    let fallbackError: string | undefined;

    try {
      pools = await fetchPoolsFromLogs();
    } catch (e: any) {
      logError = e?.message || "log_fetch_failed";
    }

    if (!pools.length) {
      try {
        const factory = getFactory();
        pools = await factory.getDeployedFunds().catch(() => []);
      } catch (e: any) {
        fallbackError = e?.message || "factory_fallback_failed";
      }
    }

    if (debug) {
      debugInfo = {
        rpc: process.env.NEXT_PUBLIC_POLYGON_RPC || "missing",
        startBlock: start,
        latestBlock: latest,
        poolsFromLogs: pools.length,
        logError,
        fallbackError,
      };
    }
    
    const provider = getProvider();
    const dhedge = getDhedgeReadOnly();
    
    const results = await Promise.all(
      pools.map(async (addr) => {
        try {
          const contract = new ethers.Contract(addr, ERC20_ABI, provider);
          const [name, symbol] = await Promise.all([contract.name(), contract.symbol()]);
          
          const pool = await dhedge.loadPool(addr);
          const composition = await pool.getComposition();
          const tvl = await computeTvl(composition);
          
          // Get total supply for share price calculation
          const totalSupply = await contract.totalSupply().catch(() => ethers.BigNumber.from(0));
          const sharePrice = tvl > 0 && totalSupply.gt(0) 
            ? tvl / Number(ethers.utils.formatEther(totalSupply)) 
            : 1;
          
          // Get historical returns
          const { returns24h, returns1w, returns1m } = await getPoolReturnsLight(addr, sharePrice);
          
          // Risk score based on volatility
          const volatility = Math.max(Math.abs(returns24h), Math.abs(returns1w) / 2, Math.abs(returns1m) / 4);
          const riskScore = Math.round(Math.min(100, Math.max(0, volatility * 5)));
          
          // Calculate score: combination of TVL, returns, and risk
          const score = Math.round(
            Math.min(1000, Math.max(0,
              (tvl / 1000) * 0.3 + // TVL component (normalized)
              (returns1m || 0) * 10 * 0.5 + // Returns component
              (100 - riskScore) * 0.2 // Risk component (lower risk = higher score)
            ))
          );

          return {
            address: addr,
            name,
            symbol,
            tvl,
            returns24h,
            returns1w,
            returns1m,
            riskScore,
            score,
            network: 137,
          };
        } catch (_) {
          return {
            address: addr,
            name: addr,
            symbol: "POOL",
            tvl: 0,
            returns24h: 0,
            returns1w: 0,
            returns1m: 0,
            riskScore: 50,
          };
        }
      })
    );

    // Filter by search if provided
    let filtered = results;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = results.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.symbol.toLowerCase().includes(searchLower) ||
          p.address.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({ 
      status: "success", 
      pools: filtered,
      network: 137, // Always Polygon for now
      ...(debugInfo ? { debug: debugInfo } : {}),
    });
  } catch (err: any) {
    // Log error for debugging but return a safe response
    console.error("Error fetching pools:", err);
    return NextResponse.json(
      { 
        status: "fail", 
        msg: err?.message || "Failed to fetch pools",
        pools: [], // Return empty array on error
      },
      { status: 400 }
    );
  }
}
