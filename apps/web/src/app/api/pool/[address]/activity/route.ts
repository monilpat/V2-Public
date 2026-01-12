import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getProvider } from "@/lib/dhedge-readonly";
import { formatUnits } from "ethers/lib/utils";

const POOL_LOGIC_ABI = [
  "event Deposit(address fundAddress, address investor, address assetDeposited, uint256 amountDeposited, uint256 valueDeposited, uint256 fundTokensReceived, uint256 totalInvestorFundTokens, uint256 fundValue, uint256 totalSupply, uint256 time)",
  "event Withdrawal(address fundAddress, address investor, uint256 valueWithdrawn, uint256 fundTokensWithdrawn, uint256 totalInvestorFundTokens, uint256 fundValue, uint256 totalSupply, uint256 time)",
];

const MANAGER_LOGIC_ABI = [
  "event ExchangeFrom(address fundAddress, address sourceAsset, uint256 sourceAmount, address destinationAsset, uint256 time)",
];

type ActivityType = "Deposit" | "Withdrawal" | "Trade";

interface ActivityEvent {
  type: ActivityType;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  actor: string;
  outgoing?: {
    asset: string;
    amount: string;
    valueUsd?: number;
  };
  incoming?: {
    asset: string;
    amount: string;
    valueUsd?: number;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const poolAddress = params.address;
    const searchParams = request.nextUrl.searchParams;
    const limit = Number(searchParams.get("limit") || "100");
    const typeFilter = searchParams.get("type"); // Optional filter: Deposit, Withdrawal, Trade

    const provider = getProvider();
    const poolContract = new ethers.Contract(poolAddress, POOL_LOGIC_ABI, provider);

    // Get block range
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 2_000_000); // ~90 days

    const activities: ActivityEvent[] = [];

    // Fetch deposits
    if (!typeFilter || typeFilter === "Deposit") {
      const depositFilter = poolContract.filters.Deposit();
      const depositEvents = await poolContract.queryFilter(depositFilter, fromBlock, currentBlock);
      
      for (const event of depositEvents) {
        if (!event.args) continue;
        
        let timestamp = 0;
        try {
          const block = await provider.getBlock(event.blockNumber);
          timestamp = block?.timestamp || 0;
        } catch {
          timestamp = Math.floor(Date.now() / 1000);
        }

        activities.push({
          type: "Deposit",
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp,
          actor: event.args.investor,
          incoming: {
            asset: event.args.assetDeposited,
            amount: event.args.amountDeposited.toString(),
            valueUsd: Number(formatUnits(event.args.valueDeposited, 18)),
          },
          outgoing: {
            asset: poolAddress, // Pool tokens received
            amount: event.args.fundTokensReceived.toString(),
          },
        });
      }
    }

    // Fetch withdrawals
    if (!typeFilter || typeFilter === "Withdrawal") {
      const withdrawalFilter = poolContract.filters.Withdrawal();
      const withdrawalEvents = await poolContract.queryFilter(withdrawalFilter, fromBlock, currentBlock);
      
      for (const event of withdrawalEvents) {
        if (!event.args) continue;
        
        let timestamp = 0;
        try {
          const block = await provider.getBlock(event.blockNumber);
          timestamp = block?.timestamp || 0;
        } catch {
          timestamp = Math.floor(Date.now() / 1000);
        }

        activities.push({
          type: "Withdrawal",
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp,
          actor: event.args.investor,
          outgoing: {
            asset: poolAddress, // Pool tokens burned
            amount: event.args.fundTokensWithdrawn.toString(),
          },
          incoming: {
            asset: "multiple", // Multiple assets returned
            amount: "0",
            valueUsd: Number(formatUnits(event.args.valueWithdrawn, 18)),
          },
        });
      }
    }

    // Fetch trades (from manager logic)
    if (!typeFilter || typeFilter === "Trade") {
      try {
        // Get manager logic address
        const POOL_MANAGER_ABI = ["function poolManagerLogic() view returns (address)"];
        const poolWithManager = new ethers.Contract(poolAddress, POOL_MANAGER_ABI, provider);
        const managerLogicAddress = await poolWithManager.poolManagerLogic().catch(() => null);
        
        if (managerLogicAddress && managerLogicAddress !== ethers.constants.AddressZero) {
          const managerContract = new ethers.Contract(managerLogicAddress, MANAGER_LOGIC_ABI, provider);
          const tradeFilter = managerContract.filters.ExchangeFrom();
          const tradeEvents = await managerContract.queryFilter(tradeFilter, fromBlock, currentBlock);
          
          for (const event of tradeEvents) {
            if (!event.args) continue;
            
            let timestamp = 0;
            try {
              const block = await provider.getBlock(event.blockNumber);
              timestamp = block?.timestamp || 0;
            } catch {
              timestamp = Math.floor(Date.now() / 1000);
            }

            activities.push({
              type: "Trade",
              txHash: event.transactionHash,
              blockNumber: event.blockNumber,
              timestamp,
              actor: poolAddress, // The pool itself executed the trade
              outgoing: {
                asset: event.args.sourceAsset,
                amount: event.args.sourceAmount.toString(),
              },
              incoming: {
                asset: event.args.destinationAsset,
                amount: "0", // Would need additional event data
              },
            });
          }
        }
      } catch {
        // Failed to get trades, continue without them
      }
    }

    // Sort by timestamp descending and limit
    const sortedActivities = activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    return NextResponse.json({
      status: "success",
      poolAddress,
      totalRecords: sortedActivities.length,
      activities: sortedActivities,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "fail", msg: err?.message || err },
      { status: 400 }
    );
  }
}
