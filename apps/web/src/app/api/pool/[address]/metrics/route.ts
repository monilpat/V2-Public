import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getDhedgeReadOnly, getProvider } from "@/lib/dhedge-readonly";
import { formatUnits } from "ethers/lib/utils";
import { fetchPriceUSD } from "@/lib/prices";
import {
  getHistoricalPrices,
  findPriceAtTimestamp,
  calculateRiskMetrics,
} from "@/lib/historical-prices";

const ERC20_ABI = [
  "function totalSupply() view returns (uint256)",
];

const POOL_LOGIC_ABI = [
  "function poolManagerLogic() view returns (address)",
];

const MANAGER_ABI = [
  "function manager() view returns (address)",
  "function trader() view returns (address)",
  "function getFee() view returns (uint256, uint256, uint256, uint256, uint256)",
];

// Helper to compute TVL
const computeTvl = async (composition: any[]): Promise<number> => {
  let total = 0;
  for (const item of composition) {
    try {
      const balanceValue = (item.balance as any)?._hex || (item.balance as any)?.hex || item.balance;
      const balance = BigInt(balanceValue);
      const decimals = (item as any).decimals || 18;
      const balanceFormatted = Number(formatUnits(balance, decimals));
      const price = await fetchPriceUSD(item.asset);
      total += balanceFormatted * (price || 0);
    } catch (e) {
      continue;
    }
  }
  return total;
};

// Helper to get share price
const getSharePrice = async (poolAddress: string, composition: any[]): Promise<number> => {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(poolAddress, ERC20_ABI, provider);
    const totalSupply = await contract.totalSupply();
    const tvl = await computeTvl(composition);
    if (totalSupply.gt(0)) {
      return tvl / Number(ethers.utils.formatEther(totalSupply));
    }
    return 1;
  } catch {
    return 1;
  }
};

// Helper to get manager and trader
const getManagerAndTrader = async (poolAddress: string): Promise<{ manager: string; trader: string }> => {
  try {
    const provider = getProvider();
    const poolContract = new ethers.Contract(poolAddress, POOL_LOGIC_ABI, provider);
    const managerLogicAddress = await poolContract.poolManagerLogic();
    
    if (!managerLogicAddress || managerLogicAddress === ethers.constants.AddressZero) {
      return { manager: ethers.constants.AddressZero, trader: ethers.constants.AddressZero };
    }

    const managerContract = new ethers.Contract(managerLogicAddress, MANAGER_ABI, provider);
    const [manager, trader] = await Promise.all([
      managerContract.manager().catch(() => ethers.constants.AddressZero),
      managerContract.trader().catch(() => ethers.constants.AddressZero),
    ]);

    return { manager, trader };
  } catch (e) {
    return { manager: ethers.constants.AddressZero, trader: ethers.constants.AddressZero };
  }
};

// Helper to get pool fees
const getPoolFees = async (poolAddress: string): Promise<{ performanceFee: number; exitCooldown: number }> => {
  try {
    const provider = getProvider();
    const poolContract = new ethers.Contract(poolAddress, POOL_LOGIC_ABI, provider);
    const managerLogicAddress = await poolContract.poolManagerLogic();
    
    if (!managerLogicAddress || managerLogicAddress === ethers.constants.AddressZero) {
      return { performanceFee: 0, exitCooldown: 24 * 60 * 60 };
    }

    const managerContract = new ethers.Contract(managerLogicAddress, MANAGER_ABI, provider);
    const feeData = await managerContract.getFee().catch(() => [0, 0, 0, 0, 10000]);
    const denominator = feeData[4] || 10000;
    const numerator = feeData[0] || 0;

    return {
      performanceFee: denominator > 0 ? (Number(numerator) / Number(denominator)) * 100 : 0,
      exitCooldown: 24 * 60 * 60,
    };
  } catch (e) {
    return { performanceFee: 0, exitCooldown: 24 * 60 * 60 };
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const poolAddress = params.address;
    const dhedge = getDhedgeReadOnly();
    const pool = await dhedge.loadPool(poolAddress);
    const composition = await pool.getComposition();
    const tvl = await computeTvl(composition);
    const sharePrice = await getSharePrice(poolAddress, composition);
    const { manager, trader } = await getManagerAndTrader(poolAddress);
    const { performanceFee, exitCooldown } = await getPoolFees(poolAddress);

    // Get historical prices from Deposit events
    const historicalPrices = await getHistoricalPrices(poolAddress);
    
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
    
    // Find historical prices at each time window
    const price24h = findPriceAtTimestamp(historicalPrices, oneDayAgo, sharePrice);
    const price1w = findPriceAtTimestamp(historicalPrices, oneWeekAgo, sharePrice);
    const price1m = findPriceAtTimestamp(historicalPrices, oneMonthAgo, sharePrice);
    
    // Calculate returns
    const returns24h = price24h > 0 ? ((sharePrice - price24h) / price24h) * 100 : 0;
    const returns1w = price1w > 0 ? ((sharePrice - price1w) / price1w) * 100 : 0;
    const returns1m = price1m > 0 ? ((sharePrice - price1m) / price1m) * 100 : 0;
    
    // Calculate risk metrics
    const riskMetrics = calculateRiskMetrics(historicalPrices);
    
    // Risk score based on volatility (simplified: higher absolute returns = higher risk)
    const volatility = Math.max(Math.abs(returns24h), Math.abs(returns1w) / 2, Math.abs(returns1m) / 4);
    const riskScore = Math.round(Math.min(100, Math.max(0, volatility * 5)));

    return NextResponse.json({
      status: "success",
      metrics: {
        tvl,
        returns24h,
        returns1w,
        returns1m,
        riskScore,
        trader,
        manager,
        performanceFee,
        exitCooldown,
        historicalDataPoints: historicalPrices.length,
        sortinoRatio: riskMetrics.sortinoRatio,
        downsideVolatility: riskMetrics.downsideVolatility,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "fail", msg: err?.message || err },
      { status: 400 }
    );
  }
}
