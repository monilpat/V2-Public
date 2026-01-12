import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getProvider } from "@/lib/dhedge-readonly";
import { formatUnits } from "ethers/lib/utils";

const POOL_LOGIC_ABI = [
  "event Deposit(address fundAddress, address investor, address assetDeposited, uint256 amountDeposited, uint256 valueDeposited, uint256 fundTokensReceived, uint256 totalInvestorFundTokens, uint256 fundValue, uint256 totalSupply, uint256 time)",
];

interface DepositEvent {
  txHash: string;
  blockNumber: number;
  timestamp: number;
  investor: string;
  assetDeposited: string;
  amountDeposited: string;
  valueDeposited: number;
  fundTokensReceived: string;
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

    // Query Deposit events
    const depositFilter = contract.filters.Deposit();
    
    // Get events from last ~90 days of blocks
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 2_000_000);

    const events = await contract.queryFilter(depositFilter, fromBlock, currentBlock);

    // Process events
    const deposits: DepositEvent[] = [];
    
    for (const event of events) {
      if (!event.args) continue;
      
      // Get block timestamp
      let timestamp = 0;
      try {
        const block = await provider.getBlock(event.blockNumber);
        timestamp = block?.timestamp || 0;
      } catch {
        // Use current time as fallback
        timestamp = Math.floor(Date.now() / 1000);
      }

      const valueDeposited = Number(formatUnits(event.args.valueDeposited, 18));
      
      // Filter by minimum value
      if (valueDeposited < minValue) continue;

      deposits.push({
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp,
        investor: event.args.investor,
        assetDeposited: event.args.assetDeposited,
        amountDeposited: event.args.amountDeposited.toString(),
        valueDeposited,
        fundTokensReceived: event.args.fundTokensReceived.toString(),
      });
    }

    // Sort by timestamp descending and limit
    const sortedDeposits = deposits
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    return NextResponse.json({
      status: "success",
      poolAddress,
      totalDeposits: sortedDeposits.length,
      minValueFilter: minValue,
      deposits: sortedDeposits,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "fail", msg: err?.message || err },
      { status: 400 }
    );
  }
}
