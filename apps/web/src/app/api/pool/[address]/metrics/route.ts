import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getDhedgeReadOnly, getProvider } from "@/lib/dhedge-readonly";
import { formatUnits } from "ethers/lib/utils";

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
      const balance = BigInt(item.balance.hex || item.balance._hex || item.balance);
      const decimals = item.decimals || 18;
      const balanceFormatted = Number(formatUnits(balance, decimals));
      // Stub price - replace with actual price fetching
      const price = 1;
      total += balanceFormatted * price;
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
      exitCooldown: 24 * 60 * 60, // Default 1 day
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
    const provider = getProvider();
    const dhedge = getDhedgeReadOnly();
    const pool = await dhedge.loadPool(poolAddress);
    const composition = await pool.getComposition();
    const tvl = await computeTvl(composition);
    const sharePrice = await getSharePrice(poolAddress, composition);
    const { manager, trader } = await getManagerAndTrader(poolAddress);
    const { performanceFee, exitCooldown } = await getPoolFees(poolAddress);

    // Stub returns (would need historical data)
    const returns24h = 0;
    const returns1w = 0;
    const returns1m = 0;
    const riskScore = 50; // Default medium risk

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
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "fail", msg: err?.message || err },
      { status: 400 }
    );
  }
}
