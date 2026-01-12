import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getDhedgeReadOnly, getProvider } from "@/lib/dhedge-readonly";
import { polygonConfig } from "@/config/polygon";
import { fetchPriceUSD } from "@/lib/prices";

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
];


// Helper to get factory
const getFactory = () => {
  const provider = getProvider();
  return new ethers.Contract(polygonConfig.factoryAddress, FACTORY_ABI, provider);
};

// Helper to compute TVL from composition
const computeTvl = async (composition: any[]): Promise<number> => {
  let total = 0;
  const provider = getProvider();
  
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const network = searchParams.get("network");
    
    // For now, only support Polygon (137). Network parameter is accepted but ignored.
    // This allows the frontend to pass it without errors.
    if (network && network !== "137" && network !== "polygon") {
      return NextResponse.json(
        { status: "fail", msg: "Only Polygon network (137) is currently supported" },
        { status: 400 }
      );
    }
    
    const factory = getFactory();
    const pools: string[] = await factory.getDeployedFunds().catch(() => []);
    
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
          
          // Calculate returns and risk score (simplified - would use historical data in production)
          const returns24h = 0; // Would need historical data
          const returns1w = 0; // Would need historical data  
          const returns1m = 0; // Would need historical data
          const riskScore = Math.round(Math.min(100, Math.max(0, 50))); // Default medium risk
          
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
