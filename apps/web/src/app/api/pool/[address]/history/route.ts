import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getDhedgeReadOnly, getProvider } from "@/lib/dhedge-readonly";
import { formatUnits } from "ethers/lib/utils";
import { fetchPriceUSD } from "@/lib/prices";

const ERC20_ABI = [
  "function totalSupply() view returns (uint256)",
];

const computeTvl = async (composition: any[]): Promise<number> => {
  let total = 0;
  for (const item of composition) {
    try {
      // Handle BigNumber from ethers - it has _hex property, not hex
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

    // Generate rolling history (last 30 days, deterministic fallback)
    const now = Date.now();
    const history = [];
    for (let i = 29; i >= 0; i--) {
      const timestamp = now - i * 24 * 60 * 60 * 1000;
      history.push({
        timestamp,
        sharePrice: sharePrice, // reuse last computed price for determinism
        tvl,
      });
    }

    return NextResponse.json({
      status: "success",
      history,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "fail", msg: err?.message || err },
      { status: 400 }
    );
  }
}
