import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getDhedgeReadOnly, getProvider } from "@/lib/dhedge-readonly";
import { polygonConfig } from "@/config/polygon";
import { fetchPriceUSD } from "@/lib/prices";

// Force dynamic to ensure Vercel recognizes this as a dynamic route
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
];

const FACTORY_ABI = [
  "function getManagedPools(address manager) view returns (address[])",
];

// Helper to compute TVL from composition
const computeTvl = async (composition: any[]): Promise<number> => {
  let total = 0;

  for (const item of composition) {
    try {
      const balanceValue =
        (item.balance as any)?._hex || (item.balance as any)?.hex || item.balance;
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

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const managerAddress = params.address;

    // Validate address format
    if (!managerAddress || !ethers.utils.isAddress(managerAddress)) {
      return NextResponse.json({
        status: "fail",
        msg: "Invalid address format",
        pools: [],
      });
    }

    let provider;
    try {
      provider = getProvider();
    } catch (e: any) {
      console.error("Failed to get provider:", e?.message);
      return NextResponse.json({
        status: "partial",
        pools: [],
        error: "Failed to connect to blockchain",
      });
    }

    // Get managed pools directly from factory contract
    let managedPools: string[] = [];
    try {
      const factory = new ethers.Contract(
        polygonConfig.factoryAddress,
        FACTORY_ABI,
        provider
      );
      managedPools = await factory.getManagedPools(managerAddress);
      console.log(
        `Found ${managedPools.length} managed pools for ${managerAddress}`
      );
    } catch (e: any) {
      console.error("Error getting managed pools:", e?.message);
      return NextResponse.json({
        status: "partial",
        pools: [],
        error: "Failed to fetch managed pools from contract",
      });
    }

    if (managedPools.length === 0) {
      return NextResponse.json({
        status: "success",
        pools: [],
      });
    }

    let dhedge;
    try {
      dhedge = getDhedgeReadOnly();
    } catch (e: any) {
      console.error("Failed to initialize dHEDGE SDK:", e?.message);
      return NextResponse.json({
        status: "partial",
        pools: [],
        error: "Failed to initialize SDK",
      });
    }

    // Fetch pool details
    const pools = await Promise.all(
      managedPools.map(async (poolAddr) => {
        try {
          const erc20 = new ethers.Contract(poolAddr, ERC20_ABI, provider);

          const [name, symbol, totalSupply] = await Promise.all([
            erc20.name(),
            erc20.symbol(),
            erc20.totalSupply(),
          ]);

          // Calculate TVL with real prices
          let tvl = 0;
          try {
            const pool = await dhedge.loadPool(poolAddr);
            const composition = await pool.getComposition();
            tvl = await computeTvl(composition);
          } catch (e) {
            console.error(`Failed to load pool ${poolAddr}:`, e);
          }

          const sharePrice =
            totalSupply.gt(0) && tvl > 0
              ? tvl / Number(ethers.utils.formatEther(totalSupply))
              : 1;

          return {
            address: poolAddr,
            name,
            symbol,
            tvl,
            sharePrice,
            network: 137,
          };
        } catch (e) {
          console.error(`Error processing pool ${poolAddr}:`, e);
          return {
            address: poolAddr,
            name: poolAddr,
            symbol: "POOL",
            tvl: 0,
            sharePrice: 1,
            network: 137,
          };
        }
      })
    );

    return NextResponse.json({
      status: "success",
      pools,
    });
  } catch (err: any) {
    console.error("Managed pools route error:", err?.message);
    return NextResponse.json({
      status: "partial",
      pools: [],
      error: err?.message || "Unknown error",
    });
  }
}
