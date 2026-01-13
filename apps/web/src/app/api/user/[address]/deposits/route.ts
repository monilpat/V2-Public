import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getDhedgeReadOnly, getProvider } from "@/lib/dhedge-readonly";
import { polygonConfig } from "@/config/polygon";
import { fetchPriceUSD } from "@/lib/prices";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
];

const POOL_EVENTS_ABI = [
  "event Deposit(address fundAddress,address investor,address assetDeposited,uint256 amountDeposited,uint256 valueDeposited,uint256 fundTokensReceived,uint256 totalInvestorFundTokens,uint256 fundValue,uint256 totalSupply,uint256 time)",
  "event Withdrawal(address fundAddress,address investor,uint256 valueWithdrawn,uint256 fundTokensWithdrawn,uint256 totalInvestorFundTokens,uint256 fundValue,uint256 totalSupply,uint256 time)",
];

const FACTORY_ABI = ["function getDeployedFunds() view returns (address[])"];

// Helper to get user's cost basis from Deposit/Withdrawal events
const getUserCostBasis = async (
  poolAddress: string,
  userAddress: string,
  userBalance: ethers.BigNumber
): Promise<{ costBasis: number; totalDeposited: number; totalWithdrawn: number }> => {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(poolAddress, POOL_EVENTS_ABI, provider);
    
    const currentBlock = await provider.getBlockNumber();
    // Look back ~6 months of blocks to capture most user activity
    const fromBlock = Math.max(0, currentBlock - 1_000_000);
    
    // Query Deposit events for this user
    const depositFilter = contract.filters.Deposit(null, userAddress);
    const depositEvents = await contract.queryFilter(depositFilter, fromBlock, currentBlock);
    
    // Query Withdrawal events for this user
    const withdrawalFilter = contract.filters.Withdrawal(null, userAddress);
    const withdrawalEvents = await contract.queryFilter(withdrawalFilter, fromBlock, currentBlock);
    
    let totalDeposited = 0;
    let totalTokensDeposited = ethers.BigNumber.from(0);
    
    for (const event of depositEvents) {
      try {
        const args = event.args;
        if (!args) continue;
        
        // valueDeposited is the USD value at time of deposit
        const valueDeposited = args.valueDeposited;
        const tokensReceived = args.fundTokensReceived;
        
        if (valueDeposited) {
          totalDeposited += Number(ethers.utils.formatEther(valueDeposited));
        }
        if (tokensReceived) {
          totalTokensDeposited = totalTokensDeposited.add(tokensReceived);
        }
      } catch (e) {
        continue;
      }
    }
    
    let totalWithdrawn = 0;
    let totalTokensWithdrawn = ethers.BigNumber.from(0);
    
    for (const event of withdrawalEvents) {
      try {
        const args = event.args;
        if (!args) continue;
        
        const valueWithdrawn = args.valueWithdrawn;
        const tokensWithdrawn = args.fundTokensWithdrawn;
        
        if (valueWithdrawn) {
          totalWithdrawn += Number(ethers.utils.formatEther(valueWithdrawn));
        }
        if (tokensWithdrawn) {
          totalTokensWithdrawn = totalTokensWithdrawn.add(tokensWithdrawn);
        }
      } catch (e) {
        continue;
      }
    }
    
    // Calculate cost basis:
    // If user has withdrawn some tokens, we need to proportionally reduce their cost basis
    const netTokens = totalTokensDeposited.sub(totalTokensWithdrawn);
    
    let costBasis = totalDeposited - totalWithdrawn;
    
    // If they have more tokens than net (shouldn't happen but defensive)
    // or if we couldn't track all events, estimate based on current balance proportion
    if (netTokens.gt(0) && userBalance.gt(0)) {
      // Cost basis proportional to remaining tokens
      const balanceRatio = Number(ethers.utils.formatEther(userBalance)) / 
                          Number(ethers.utils.formatEther(netTokens));
      costBasis = (totalDeposited - totalWithdrawn) * Math.min(1, balanceRatio);
    }
    
    return {
      costBasis: Math.max(0, costBasis),
      totalDeposited,
      totalWithdrawn,
    };
  } catch (e) {
    return { costBasis: 0, totalDeposited: 0, totalWithdrawn: 0 };
  }
};

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

          // Calculate TVL with real prices
          const pool = await dhedge.loadPool(poolAddr);
          const composition = await pool.getComposition();
          let tvl = 0;
          for (const item of composition) {
            try {
              const bal = BigInt((item as any).balance?._hex || (item as any).balance?.hex || item.balance);
              const decimals = (item as any).decimals || 18;
              const balFmt = Number(ethers.utils.formatUnits(bal, decimals));
              const price = await fetchPriceUSD(item.asset);
              tvl += balFmt * (price || 0);
            } catch (e) {
              continue;
            }
          }
          
          const sharePrice = totalSupply.gt(0)
            ? tvl / Number(ethers.utils.formatEther(totalSupply))
            : 1;
          const currentValue = Number(ethers.utils.formatEther(balance)) * sharePrice;

          // Get user's cost basis from historical events
          const { costBasis, totalDeposited, totalWithdrawn } = await getUserCostBasis(
            poolAddr, 
            userAddress,
            balance
          );
          
          // Calculate PnL
          const pnl = costBasis > 0 ? currentValue - costBasis : 0;
          const pnlPercent = costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0;

          return {
            pool: poolAddr,
            name,
            symbol,
            balance: ethers.utils.formatEther(balance),
            sharePrice,
            value: currentValue,
            costBasis,
            totalDeposited,
            totalWithdrawn,
            pnl,
            pnlPercent,
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
