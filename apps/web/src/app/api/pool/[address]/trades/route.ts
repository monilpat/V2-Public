import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { Dhedge, Network } from "@dhedge/v2-sdk";

const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

const getProvider = () => {
  const rpc = process.env.NEXT_PUBLIC_POLYGON_RPC;
  if (!rpc) throw new Error("NEXT_PUBLIC_POLYGON_RPC not configured");
  return new ethers.providers.JsonRpcProvider(rpc);
};

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const poolAddress = params.address;
    const provider = getProvider();
    const poolContract = new ethers.Contract(poolAddress, ERC20_ABI, provider);
    
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 10000); // Last ~10k blocks
    
    try {
      const transferFilter = poolContract.filters.Transfer();
      const transfers = await poolContract.queryFilter(transferFilter, fromBlock, currentBlock);
      
      const trades = transfers.slice(-20).map((event: any) => ({
        timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Stub timestamp
        fromAsset: "0x0000000000000000000000000000000000000000",
        toAsset: "0x0000000000000000000000000000000000000000",
        amount: ethers.utils.formatEther(event.args.value || 0),
        txHash: event.transactionHash,
      }));

      return NextResponse.json({
        status: "success",
        trades: trades.slice(0, 10),
      });
    } catch (e) {
      return NextResponse.json({
        status: "success",
        trades: [],
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { status: "fail", msg: err?.message || err },
      { status: 400 }
    );
  }
}
