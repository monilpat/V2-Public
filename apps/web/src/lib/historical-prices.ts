import { ethers } from "ethers";
import { getProvider } from "@/lib/dhedge-readonly";

const POOL_LOGIC_ABI = [
  "event Deposit(address fundAddress,address investor,address assetDeposited,uint256 amountDeposited,uint256 valueDeposited,uint256 fundTokensReceived,uint256 totalInvestorFundTokens,uint256 fundValue,uint256 totalSupply,uint256 time)",
];

// Historical price point from Deposit events
export type HistoricalPrice = {
  timestamp: number;
  price: number;
  fundValue: number;
  totalSupply: number;
};

// Pool returns data
export type PoolReturns = {
  returns24h: number;
  returns1w: number;
  returns1m: number;
  historicalDataPoints: number;
};

// Risk metrics data
export type RiskMetrics = {
  sortinoRatio: number;
  downsideVolatility: number;
  dailyReturns: number[];
};

/**
 * Query Deposit events to derive historical token prices
 */
export async function getHistoricalPrices(
  poolAddress: string,
  blockLookback: number = 500_000
): Promise<HistoricalPrice[]> {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(poolAddress, POOL_LOGIC_ABI, provider);
    
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - blockLookback);
    
    const depositFilter = contract.filters.Deposit();
    const events = await contract.queryFilter(depositFilter, fromBlock, currentBlock);
    
    const prices: HistoricalPrice[] = [];
    
    for (const event of events) {
      try {
        const args = event.args;
        if (!args) continue;
        
        const fundValue = args.fundValue;
        const totalSupply = args.totalSupply;
        const eventTime = args.time;
        
        if (fundValue && totalSupply && totalSupply.gt(0)) {
          const price = Number(ethers.utils.formatEther(fundValue)) / 
                       Number(ethers.utils.formatEther(totalSupply));
          const timestamp = eventTime ? Number(eventTime) * 1000 : Date.now();
          
          prices.push({
            timestamp,
            price,
            fundValue: Number(ethers.utils.formatEther(fundValue)),
            totalSupply: Number(ethers.utils.formatEther(totalSupply)),
          });
        }
      } catch (e) {
        continue;
      }
    }
    
    // Sort by timestamp ascending
    prices.sort((a, b) => a.timestamp - b.timestamp);
    
    return prices;
  } catch (e) {
    return [];
  }
}

/**
 * Find price closest to a target timestamp
 */
export function findPriceAtTimestamp(
  prices: HistoricalPrice[], 
  targetTimestamp: number, 
  currentPrice: number
): number {
  if (prices.length === 0) return currentPrice;
  
  let closestPrice = currentPrice;
  let closestTimeDiff = Infinity;
  
  for (const p of prices) {
    const timeDiff = Math.abs(p.timestamp - targetTimestamp);
    if (p.timestamp <= targetTimestamp && timeDiff < closestTimeDiff) {
      closestTimeDiff = timeDiff;
      closestPrice = p.price;
    }
  }
  
  // If no price before target, use the earliest available
  if (closestTimeDiff === Infinity && prices.length > 0) {
    closestPrice = prices[0].price;
  }
  
  return closestPrice;
}

/**
 * Calculate pool returns from historical prices
 */
export async function getPoolReturns(
  poolAddress: string,
  currentSharePrice: number
): Promise<PoolReturns> {
  const historicalPrices = await getHistoricalPrices(poolAddress);
  
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
  
  const price24h = findPriceAtTimestamp(historicalPrices, oneDayAgo, currentSharePrice);
  const price1w = findPriceAtTimestamp(historicalPrices, oneWeekAgo, currentSharePrice);
  const price1m = findPriceAtTimestamp(historicalPrices, oneMonthAgo, currentSharePrice);
  
  const returns24h = price24h > 0 ? ((currentSharePrice - price24h) / price24h) * 100 : 0;
  const returns1w = price1w > 0 ? ((currentSharePrice - price1w) / price1w) * 100 : 0;
  const returns1m = price1m > 0 ? ((currentSharePrice - price1m) / price1m) * 100 : 0;
  
  return {
    returns24h,
    returns1w,
    returns1m,
    historicalDataPoints: historicalPrices.length,
  };
}

/**
 * Calculate daily returns from historical prices
 */
export function calculateDailyReturns(prices: HistoricalPrice[]): number[] {
  if (prices.length < 2) return [];
  
  const dailyReturns: number[] = [];
  
  // Group prices by day and get the last price for each day
  const pricesByDay = new Map<string, number>();
  for (const p of prices) {
    const dayKey = new Date(p.timestamp).toISOString().split('T')[0];
    pricesByDay.set(dayKey, p.price);
  }
  
  // Convert to sorted array
  const sortedDays = Array.from(pricesByDay.entries()).sort((a, b) => 
    new Date(a[0]).getTime() - new Date(b[0]).getTime()
  );
  
  // Calculate daily returns
  for (let i = 1; i < sortedDays.length; i++) {
    const prevPrice = sortedDays[i - 1][1];
    const currPrice = sortedDays[i][1];
    if (prevPrice > 0) {
      const dailyReturn = (currPrice - prevPrice) / prevPrice;
      dailyReturns.push(dailyReturn);
    }
  }
  
  return dailyReturns;
}

/**
 * Calculate risk metrics (Sortino Ratio and Downside Volatility)
 */
export function calculateRiskMetrics(
  historicalPrices: HistoricalPrice[],
  riskFreeRate: number = 0.05 // 5% annual
): RiskMetrics {
  const dailyReturns = calculateDailyReturns(historicalPrices);
  
  if (dailyReturns.length < 2) {
    return {
      sortinoRatio: 0,
      downsideVolatility: 0,
      dailyReturns: [],
    };
  }
  
  // Calculate downside returns (only negative returns)
  const negativeReturns = dailyReturns.filter(r => r < 0);
  
  // Downside deviation (annualized)
  let downsideVolatility = 0;
  if (negativeReturns.length > 0) {
    const sumSquaredNegative = negativeReturns.reduce((sum, r) => sum + r * r, 0);
    const downsideDeviation = Math.sqrt(sumSquaredNegative / negativeReturns.length);
    // Annualize (multiply by sqrt(365) for daily data) and convert to percentage
    downsideVolatility = downsideDeviation * Math.sqrt(365) * 100;
  }
  
  // Average daily return
  const avgDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  
  // Daily risk-free rate
  const dailyRiskFreeRate = riskFreeRate / 365;
  
  // Sortino Ratio (annualized)
  // Sortino = (Avg Return - Risk Free Rate) / Downside Deviation
  let sortinoRatio = 0;
  if (downsideVolatility > 0) {
    const excessReturn = avgDailyReturn - dailyRiskFreeRate;
    // Annualize the excess return and divide by annualized downside volatility
    const annualizedExcessReturn = excessReturn * 365 * 100; // Convert to percentage
    sortinoRatio = annualizedExcessReturn / downsideVolatility;
  }
  
  return {
    sortinoRatio: Math.round(sortinoRatio * 100) / 100, // Round to 2 decimals
    downsideVolatility: Math.round(downsideVolatility * 100) / 100,
    dailyReturns,
  };
}
