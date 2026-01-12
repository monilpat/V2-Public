import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getDhedgeReadOnly, getProvider } from "@/lib/dhedge-readonly";
import { polygonConfig } from "@/config/polygon";

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
      const balance = BigInt(item.balance.hex || item.balance._hex || item.balance);
      const decimals = item.decimals || 18;
      const balanceFormatted = Number(ethers.utils.formatUnits(balance, decimals));
      
      // Simple price fetch (you can enhance this with your price API)
      // For now, using a stub - you'd want to use your price fetching logic
      const price = 1; // Stub - replace with actual price fetching
      total += balanceFormatted * price;
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
    
    const factory = getFactory();
    const pools: string[] = await factory.getDeployedFunds();
    
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
          
          return {
            address: addr,
            name,
            symbol,
            tvl,
            returns24h: 0,
            returns1w: 0,
            returns1m: 0,
            riskScore: Math.floor(Math.random() * 100),
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

    return NextResponse.json({ status: "success", pools: filtered });
  } catch (err: any) {
    return NextResponse.json(
      { status: "fail", msg: err?.message || err },
      { status: 400 }
    );
  }
}
