import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getProvider } from "@/lib/dhedge-readonly";

const POOL_LOGIC_ABI = [
  "event TransactionExecuted(address pool, address manager, uint16 transactionType, uint256 time)",
];

// Transaction types from dHEDGE contracts
const TX_TYPE_EXCHANGE = 2;
const TX_TYPE_NAMES: Record<number, string> = {
  0: "Unknown",
  1: "Add Liquidity",
  2: "Exchange",
  3: "Remove Liquidity",
  4: "Stake",
  5: "Unstake",
  6: "Claim",
  7: "Borrow",
  8: "Repay",
  9: "Supply",
  10: "Withdraw",
};

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const poolAddress = params.address;
    const provider = getProvider();
    const poolContract = new ethers.Contract(poolAddress, POOL_LOGIC_ABI, provider);
    
    const currentBlock = await provider.getBlockNumber();
    // Look back ~7 days of blocks (~300k blocks on Polygon with ~2s block time)
    const fromBlock = Math.max(0, currentBlock - 300_000);
    
    try {
      // Query TransactionExecuted events (all types for now, filter for exchanges)
      const txFilter = poolContract.filters.TransactionExecuted(poolAddress);
      const events = await poolContract.queryFilter(txFilter, fromBlock, currentBlock);
      
      // Filter for exchange transactions and map to trade format
      const trades = await Promise.all(
        events
          .filter((event: any) => {
            const txType = event.args?.transactionType;
            // Include exchange and other trading-related types
            return txType === TX_TYPE_EXCHANGE || txType === 1 || txType === 3;
          })
          .slice(-20)
          .map(async (event: any) => {
            const args = event.args;
            const txType = Number(args?.transactionType || 0);
            
            // Use event timestamp from args, or fall back to block timestamp
            let timestamp: number;
            if (args?.time) {
              timestamp = Number(args.time) * 1000;
            } else {
              try {
                const block = await provider.getBlock(event.blockNumber);
                timestamp = block.timestamp * 1000;
              } catch {
                timestamp = Date.now();
              }
            }
            
            return {
              timestamp,
              type: TX_TYPE_NAMES[txType] || `Type ${txType}`,
              txType,
              manager: args?.manager || ethers.constants.AddressZero,
              txHash: event.transactionHash,
              blockNumber: event.blockNumber,
            };
          })
      );
      
      // Sort by timestamp descending (most recent first)
      trades.sort((a, b) => b.timestamp - a.timestamp);

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
