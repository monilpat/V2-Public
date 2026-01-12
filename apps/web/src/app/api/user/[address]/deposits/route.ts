import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getDhedgeReadOnly, getProvider } from "@/lib/dhedge-readonly";
import { polygonConfig } from "@/config/polygon";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
];

const FACTORY_ABI = ["function getDeployedFunds() view returns (address[])"];

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const userAddress = params.address;
    const provider = getProvider();
    const factory = new ethers.Contract(polygonConfig.factoryAddress, FACTORY_ABI, provider);
    const pools: string[] = await factory.getDeployedFunds();
    const dhedge = getDhedgeReadOnly();

    const deposits = await Promise.all(
      pools.map(async (poolAddr) => {
        try {
          const erc20 = new ethers.Contract(poolAddr, ERC20_ABI, provider);
          const balance = await erc20.balanceOf(userAddress);
          if (balance.eq(0)) return null;

          const [name, symbol, totalSupply] = await Promise.all([
            erc20.name(),
            erc20.symbol(),
            erc20.totalSupply(),
          ]);

          // Basic TVL via composition with stub price=1
          const pool = await dhedge.loadPool(poolAddr);
          const composition = await pool.getComposition();
          let tvl = 0;
          for (const item of composition) {
            try {
              const bal = BigInt((item as any).balance?._hex || (item as any).balance?.hex || item.balance);
              const decimals = (item as any).decimals || 18;
              const balFmt = Number(ethers.utils.formatUnits(bal, decimals));
              tvl += balFmt; // price stub 1
            } catch (e) {
              continue;
            }
          }
          const sharePrice = totalSupply.gt(0)
            ? tvl / Number(ethers.utils.formatEther(totalSupply))
            : 1;
          const value = Number(ethers.utils.formatEther(balance)) * sharePrice;

          return {
            pool: poolAddr,
            name,
            symbol,
            balance: ethers.utils.formatEther(balance),
            sharePrice,
            value,
            pnl: 0,
          };
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json({
      status: "success",
      deposits: deposits.filter((d) => d !== null),
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "fail", msg: err?.message || err },
      { status: 400 }
    );
  }
}
