import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getProvider } from "@/lib/dhedge-readonly";
import { formatUnits } from "ethers/lib/utils";

const POOL_LOGIC_ABI = [
  "event Withdrawal(address fundAddress, address investor, uint256 valueWithdrawn, uint256 fundTokensWithdrawn, uint256 totalInvestorFundTokens, uint256 fundValue, uint256 totalSupply, uint256 time)",
];

interface WithdrawalEvent {
  txHash: string;
  blockNumber: number;
  timestamp: number;
  investor: string;
  valueWithdrawn: number;
  fundTokensWithdrawn: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const poolAddress = params.address;
    const searchParams = request.nextUrl.searchParams;
    const minValue = Number(searchParams.get("minValue") || "10"); // Default min $10
    const limit = Number(searchParams.get("limit") || "100");

    const provider = getProvider();
    const contract = new ethers.Contract(poolAddress, POOL_LOGIC_ABI, provider);

    // Query Withdrawal events
    const withdrawalFilter = contract.filters.Withdrawal();
    
    // Get events from last ~90 days of blocks
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 2_000_000);

    const events = await contract.queryFilter(withdrawalFilter, fromBlock, currentBlock);

    // Process events
    const withdrawals: WithdrawalEvent[] = [];
    
    for (const event of events) {
      if (!event.args) continue;
      
      // Get block timestamp
      let timestamp = 0;
      try {
        const block = await provider.getBlock(event.blockNumber);
        timestamp = block?.timestamp || 0;
      } catch {
        timestamp = Math.floor(Date.now() / 1000);
      }

      const valueWithdrawn = Number(formatUnits(event.args.valueWithdrawn, 18));
      
      // Filter by minimum value
      if (valueWithdrawn < minValue) continue;

      withdrawals.push({
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp,
        investor: event.args.investor,
        valueWithdrawn,
        fundTokensWithdrawn: event.args.fundTokensWithdrawn.toString(),
      });
    }

    // Sort by timestamp descending and limit
    const sortedWithdrawals = withdrawals
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    return NextResponse.json({
      status: "success",
      poolAddress,
      totalWithdrawals: sortedWithdrawals.length,
      minValueFilter: minValue,
      withdrawals: sortedWithdrawals,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "fail", msg: err?.message || err },
      { status: 400 }
    );
  }
}
